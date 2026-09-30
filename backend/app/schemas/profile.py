from __future__ import annotations

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class UserProfileBase(BaseModel):
    # Personal Info
    full_name: Optional[str] = Field(None, description="User full display name")
    dob: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    age: Optional[int] = Field(None, description="Age of the user")
    gender: Optional[str] = Field(None, description="Gender of the user")

    # Body Measurements
    height: Optional[float] = Field(None, description="Height numerical value")
    height_unit: Optional[str] = Field("cm", description="Height unit (cm or ft)")
    weight: Optional[float] = Field(None, description="Weight numerical value")
    weight_unit: Optional[str] = Field("kg", description="Weight unit (kg or lbs)")
    bmi: Optional[float] = Field(None, description="Body Mass Index")

    # Medical Background
    medical_conditions: Optional[str] = Field(None, description="Known medical conditions")
    previous_surgeries: Optional[str] = Field(None, description="Previous surgeries")
    allergies: Optional[str] = Field(None, description="Known allergies")
    medications: Optional[str] = Field(None, description="Current medications")
    family_history: Optional[str] = Field(None, description="Family medical history")
    major_medical_events: Optional[str] = Field(None, description="Previous major medical events")

    # Lifestyle
    activity_level: Optional[str] = Field(None, description="Sedentary, Lightly Active, Moderately Active, Very Active")
    exercise_frequency: Optional[str] = Field(None, description="Frequency of regular physical exercise")
    sleep_information: Optional[str] = Field(None, description="Average sleep duration and quality")
    smoking_status: Optional[str] = Field(None, description="Smoking status")
    alcohol_consumption: Optional[str] = Field(None, description="Alcohol consumption habits")

    # Health Context
    health_concerns: Optional[str] = Field(None, description="Primary health concerns")
    health_goals: Optional[str] = Field(None, description="Primary health and fitness goals")
    dietary_preference: Optional[str] = Field(None, description="Dietary preference (Vegetarian, Vegan, Keto, None, etc.)")

    # Onboarding
    onboarding_completed: Optional[bool] = Field(False, description="Flag indicating first-time profile completion")


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(UserProfileBase):
    pass


class MeasurementHistoryPoint(BaseModel):
    id: int
    value: float
    unit: str
    recorded_at: datetime

    model_config = {"from_attributes": True}


class MeasurementHistoryResponse(BaseModel):
    measurement_type: str
    current_value: Optional[float] = None
    current_unit: Optional[str] = None
    points: List[MeasurementHistoryPoint] = []


class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    weight_history: List[MeasurementHistoryPoint] = []

    model_config = {"from_attributes": True}
