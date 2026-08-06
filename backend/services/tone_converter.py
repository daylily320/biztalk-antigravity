import os
from dotenv import load_dotenv
from langchain_upstage import ChatUpstage
from langchain_core.prompts import ChatPromptTemplate
from backend.prompts.templates import PROMPTS

# 환경 변수 로드 (.env 파일이 루트 디렉토리에 있으므로 이를 탐색)
# backend 디렉토리에서 실행될 경우를 대비해 상위 디렉토리도 탐색 가능하게 load_dotenv 설정
load_dotenv()

class ToneConverterService:
    def __init__(self):
        api_key = os.getenv("UPSTAGE_API_KEY")
        if not api_key:
            # fallback으로 시스템 환경변수 재확인
            api_key = os.environ.get("UPSTAGE_API_KEY")
            if not api_key:
                raise ValueError("UPSTAGE_API_KEY 환경 변수가 설정되지 않았습니다.")
        
        # ChatUpstage 모델 초기화 (solar-pro 사용)
        self.llm = ChatUpstage(model="solar-pro", api_key=api_key)

    def convert_tone(self, text: str, target_audience: str) -> str:
        system_instruction = PROMPTS.get(target_audience)
        if not system_instruction:
            raise ValueError(f"지원하지 않는 수신 대상입니다: {target_audience}")

        # 프롬프트 템플릿 구성
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction),
            ("human", "[원문]: {text}\n\n위 원문을 지침에 맞게 자연스러운 비즈니스 메시지로 변환해 주세요. 추가적인 설명 없이 변환 결과 텍스트만 출력해야 합니다.")
        ])

        # LCEL 체인 결합 및 호출
        chain = prompt | self.llm
        response = chain.invoke({"text": text})
        
        return response.content.strip()
