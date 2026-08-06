from fastapi import APIRouter, HTTPException, status
from backend.models.schemas import ConvertRequest, ConvertResponse
from backend.services.tone_converter import ToneConverterService

router = APIRouter()

# 서비스 클래스 인스턴스 생성 (API 키가 로딩되지 않았을 경우를 대비해 엔드포인트 호출 시점에 생성하거나 예외 처리)
try:
    converter_service = ToneConverterService()
except Exception as init_exc:
    # 지연 로딩을 위해 None으로 두고 실제 라우터 호출 시점에 초기화 할 수 있도록 조치
    converter_service = None

@router.post("/convert", response_model=ConvertResponse)
async def convert_tone_endpoint(request: ConvertRequest):
    global converter_service
    if converter_service is None:
        try:
            converter_service = ToneConverterService()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"API 초기화 에러: {str(e)}"
            )

    # 텍스트 검증 (빈 문자열 차단)
    if not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="text 필드는 필수이며 공백일 수 없습니다."
        )

    try:
        converted_text = converter_service.convert_tone(
            text=request.text,
            target_audience=request.target_audience
        )
        return ConvertResponse(
            converted_text=converted_text,
            target_audience=request.target_audience,
            original_text=request.text
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        # 내부 LLM 호출 에러인 경우 500 에러 처리
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LLM API 호출 중 오류가 발생했습니다."
        )
