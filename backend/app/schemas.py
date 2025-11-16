from pydantic import BaseModel
from typing import Optional

class RegistrationRequest(BaseModel):
    user_id: str
    business_field: str
    business_description: str
    city: Optional[str] = "Москва"

class TopTenderOut(BaseModel):
    registry_number: str
    application_start_date: Optional[str]
    application_end_date: Optional[str]
    short_name: Optional[str]
    region: Optional[str]
    starting_price: Optional[float]
    relevance_score: float

class ChatRequest(BaseModel):
    user_id: str
    registry_number: str
    user_query: str
