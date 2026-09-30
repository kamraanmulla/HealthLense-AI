from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_active_user, get_db
from app.models.user import User, UserProfile, UserMeasurementHistory
from app.schemas.profile import (
    UserProfileResponse,
    UserProfileUpdate,
    MeasurementHistoryPoint,
    MeasurementHistoryResponse,
)

router = APIRouter()


def _get_or_create_profile(user_id: int, db: Session) -> UserProfile:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def _get_weight_history(user_id: int, db: Session) -> List[MeasurementHistoryPoint]:
    records = (
        db.query(UserMeasurementHistory)
        .filter(
            UserMeasurementHistory.user_id == user_id,
            UserMeasurementHistory.measurement_type == "weight",
        )
        .order_by(UserMeasurementHistory.recorded_at.asc())
        .all()
    )
    return [MeasurementHistoryPoint.model_validate(r) for r in records]


def _build_profile_response(
    profile: UserProfile, user: User, db: Session
) -> UserProfileResponse:
    weight_hist = _get_weight_history(user.id, db)
    resp = UserProfileResponse(
        id=profile.id,
        user_id=user.id,
        full_name=user.full_name,
        dob=profile.dob,
        age=profile.age,
        gender=profile.gender,
        height=profile.height,
        height_unit=profile.height_unit or "cm",
        weight=profile.weight,
        weight_unit=profile.weight_unit or "kg",
        bmi=profile.bmi,
        medical_conditions=profile.medical_conditions,
        previous_surgeries=profile.previous_surgeries,
        allergies=profile.allergies,
        medications=profile.medications,
        family_history=profile.family_history,
        major_medical_events=profile.major_medical_events,
        activity_level=profile.activity_level,
        exercise_frequency=profile.exercise_frequency,
        sleep_information=profile.sleep_information,
        smoking_status=profile.smoking_status,
        alcohol_consumption=profile.alcohol_consumption,
        health_concerns=profile.health_concerns,
        health_goals=profile.health_goals,
        dietary_preference=profile.dietary_preference,
        onboarding_completed=bool(profile.onboarding_completed),
        weight_history=weight_hist,
    )
    return resp


@router.get(
    "",
    response_model=UserProfileResponse,
    summary="Get user health profile",
)
def get_profile(
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    profile = _get_or_create_profile(current_user.id, db)
    return _build_profile_response(profile, current_user, db)


@router.put(
    "",
    response_model=UserProfileResponse,
    summary="Update user health profile",
)
def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    profile = _get_or_create_profile(current_user.id, db)
    update_dict = profile_data.model_dump(exclude_unset=True)

    # 1. Update User full_name if provided
    if "full_name" in update_dict:
        name_val = update_dict.pop("full_name")
        if name_val is not None:
            current_user.full_name = name_val.strip()

    # 2. Check if weight changed or is first recorded
    new_weight = update_dict.get("weight")
    if new_weight is not None and new_weight > 0:
        latest_record = (
            db.query(UserMeasurementHistory)
            .filter(
                UserMeasurementHistory.user_id == current_user.id,
                UserMeasurementHistory.measurement_type == "weight",
            )
            .order_by(UserMeasurementHistory.recorded_at.desc())
            .first()
        )
        if latest_record is None or abs(latest_record.value - new_weight) > 0.01:
            w_unit = update_dict.get("weight_unit") or profile.weight_unit or "kg"
            meas = UserMeasurementHistory(
                user_id=current_user.id,
                measurement_type="weight",
                value=float(new_weight),
                unit=w_unit,
                recorded_at=datetime.now(timezone.utc),
            )
            db.add(meas)

    # 3. Auto-calculate BMI if height and weight available
    h = update_dict.get("height", profile.height)
    w = update_dict.get("weight", profile.weight)
    h_unit = update_dict.get("height_unit", profile.height_unit) or "cm"
    w_unit = update_dict.get("weight_unit", profile.weight_unit) or "kg"

    if h and w and h > 0 and w > 0:
        # Normalize to meters and kg for BMI
        h_m = (h * 0.3048) if h_unit.lower() == "ft" else (h / 100.0)
        w_kg = (w * 0.453592) if w_unit.lower() == "lbs" else w
        if h_m > 0:
            calc_bmi = round(w_kg / (h_m * h_m), 1)
            update_dict["bmi"] = calc_bmi

    # 4. Apply all remaining profile updates
    for key, value in update_dict.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    return _build_profile_response(profile, current_user, db)


@router.get(
    "/measurements/{measurement_type}",
    response_model=MeasurementHistoryResponse,
    summary="Get user body measurement history",
)
def get_measurement_history(
    measurement_type: str,
    current_user: User = Depends(get_active_user),
    db: Session = Depends(get_db),
) -> MeasurementHistoryResponse:
    profile = _get_or_create_profile(current_user.id, db)
    records = (
        db.query(UserMeasurementHistory)
        .filter(
            UserMeasurementHistory.user_id == current_user.id,
            UserMeasurementHistory.measurement_type == measurement_type.lower(),
        )
        .order_by(UserMeasurementHistory.recorded_at.asc())
        .all()
    )

    curr_val = getattr(profile, measurement_type.lower(), None)
    curr_unit = getattr(profile, f"{measurement_type.lower()}_unit", "kg")

    return MeasurementHistoryResponse(
        measurement_type=measurement_type,
        current_value=curr_val,
        current_unit=curr_unit,
        points=[MeasurementHistoryPoint.model_validate(r) for r in records],
    )
