/**
 * BizTalk Antigravity - Frontend Application Script
 */

// 1. API 호스트 주소 동적 판별
// FastAPI 내부 서빙 또는 배포 도메인인 경우 상대 경로("")를 사용하고,
// 로컬 파일 실행(file://)이나 타 포트 서빙(예: Live Server 5500포트)인 경우 백엔드 서버(localhost:8000)를 가리킵니다.
const API_BASE = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") 
    ? (window.location.port === "8000" ? "" : "http://localhost:8000") 
    : (window.location.protocol === "file:" ? "http://localhost:8000" : "");

// 상태 관리 변수
let activeTarget = "boss"; // 기본 선택값
let isConverting = false;
let typingTimer = null;

// DOM 요소 캐싱
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const charCount = document.getElementById("charCount");
const btnConvert = document.getElementById("btnConvert");
const btnCopy = document.getElementById("btnCopy");
const outputCard = document.getElementById("outputCard");
const spinner = document.getElementById("spinner");
const targetButtons = document.querySelectorAll(".target-btn");
const toastContainer = document.getElementById("toastContainer");

// 2. 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
    // 글자 수 세기 이벤트
    inputText.addEventListener("input", updateCharCount);
    
    // 수신 대상 버튼 클릭 이벤트
    targetButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const btn = e.currentTarget;
            
            // 모든 버튼 비활성화 및 클릭 버튼 활성화
            targetButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // 전역 변수에 현재 대상 코드 저장
            activeTarget = btn.dataset.target;
        });
    });
    
    // 변환하기 버튼 클릭 이벤트
    btnConvert.addEventListener("click", convertTone);
    
    // 복사하기 버튼 클릭 이벤트
    btnCopy.addEventListener("click", copyToClipboard);
});

// 3. 기능 함수 구현

// 글자 수 실시간 표시
function updateCharCount() {
    const textLength = inputText.value.length;
    charCount.textContent = textLength;
    
    if (textLength >= 2000) {
        charCount.style.color = "var(--color-danger)";
    } else {
        charCount.style.color = "var(--color-text-muted)";
    }
}

// 토스트 메시지 생성 및 제거
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // 아이콘 매핑
    const icon = type === "success" ? "✅" : (type === "error" ? "❌" : "ℹ️");
    
    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // 3초 후 토스트 제거 (애니메이션 시간 고려)
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px) scale(0.9)";
        toast.style.transition = "all 0.3s ease";
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// 로딩 상태 설정
function setLoading(loading) {
    isConverting = loading;
    btnConvert.disabled = loading;
    inputText.disabled = loading;
    targetButtons.forEach(b => b.disabled = loading);
    
    if (loading) {
        spinner.style.display = "inline-block";
        outputCard.classList.add("loading");
        btnCopy.disabled = true;
    } else {
        spinner.style.display = "none";
        outputCard.classList.remove("loading");
    }
}

// 부드러운 타이핑 효과 구현
function typeText(element, text, speed = 25) {
    // 진행 중인 타이핑이 있다면 정지
    if (typingTimer) {
        clearInterval(typingTimer);
    }
    
    element.value = "";
    let index = 0;
    
    return new Promise((resolve) => {
        typingTimer = setInterval(() => {
            if (index < text.length) {
                element.value += text.charAt(index);
                index++;
                // 텍스트 영역을 스크롤 최하단으로 유지
                element.scrollTop = element.scrollHeight;
            } else {
                clearInterval(typingTimer);
                typingTimer = null;
                resolve();
            }
        }, speed);
    });
}

// 4. API 변환 요청 통신
async function convertTone() {
    const text = inputText.value.trim();
    
    if (!text) {
        showToast("변환할 원문을 입력해주세요.", "error");
        inputText.focus();
        return;
    }
    
    if (!activeTarget) {
        showToast("수신 대상을 선택해주세요.", "error");
        return;
    }
    
    setLoading(true);
    outputText.value = "";
    outputText.placeholder = "AI가 가장 알맞은 비즈니스 말투로 번환하고 있습니다...";
    
    try {
        const response = await fetch(`${API_BASE}/api/convert`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: text,
                target_audience: activeTarget
            })
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || "서버 응답 오류가 발생했습니다.");
        }
        
        const data = await response.json();
        
        // 타이핑 효과를 연출하며 결과창에 입력
        await typeText(outputText, data.converted_text, 15);
        
        // 복사하기 버튼 활성화
        btnCopy.disabled = false;
        showToast("성공적으로 변환되었습니다!", "success");
        
    } catch (error) {
        console.error("Conversion error:", error);
        outputText.placeholder = "변환에 실패했습니다. 아래 원인을 확인하고 다시 시도해 주세요.";
        showToast(error.message || "변환 중 문제가 발생했습니다. 백엔드 상태를 확인해주세요.", "error");
    } finally {
        setLoading(false);
    }
}

// 5. 클립보드 복사
async function copyToClipboard() {
    const textToCopy = outputText.value;
    
    if (!textToCopy) {
        showToast("복사할 내용이 없습니다.", "error");
        return;
    }
    
    try {
        // Modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
        } else {
            // Fallback for older browsers or non-HTTPS environment
            const textarea = document.createElement("textarea");
            textarea.value = textToCopy;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
        showToast("클립보드에 메시지가 복사되었습니다!", "success");
    } catch (err) {
        console.error("Clipboard copy error:", err);
        showToast("복사하지 못했습니다. 수동으로 복사해주세요.", "error");
    }
}
