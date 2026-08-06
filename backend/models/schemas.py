from pydantic import BaseModel, Field
from typing import Literal

class ConvertRequest(BaseModel):
    text: str = Field(..., min_length=1, description="변환할 원문 텍스트")
    target_audience: Literal["boss", "colleague", "client", "team"] = Field(
        ..., description="수신 대상 (boss: 상사, colleague: 타팀 동료, client: 고객, team: 팀 내 동료)"
    )

class ConvertResponse(BaseModel):
    converted_text: str = Field(..., description="변환된 텍스트")
    target_audience: str = Field(..., description="수신 대상")
    original_text: str = Field(..., description="변환하기 전 원문 텍스트")
