document.addEventListener('DOMContentLoaded', () => {
    const projects = [
        { title: '배달의 민족 UI Redesign', author: '이세윤' },
        { title: '당근마켓 UI/UX Design', author: '김민지' },
        { title: '토스 앱 Redesign', author: '박지훈' },
        { title: '카카오톡 UI 개선', author: '이지은' },
        { title: '넷플릭스 모바일 앱 개선', author: '최준호' },
    ];

    const projectList = document.querySelector('.project-list');
    projectList.innerHTML = `
        <div class="selection-box"></div>
        <div class="project-wheel"></div>
    `;
    
    const projectWheel = document.querySelector('.project-wheel');
    const ITEM_HEIGHT = 50;
    let currentIndex = 0;
    let startY = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let isDragging = false;

    // 프로젝트 아이템 생성
    function initializeWheel() {
        // 클론된 항목을 포함한 총 항목 수
        const totalItems = projects.length + 2; // 두 개의 복사본 추가
        
        // 클론된 항목 추가
        const firstClone = document.createElement('div');
        firstClone.className = 'project-item';
        firstClone.textContent = projects[projects.length - 1].title; // 마지막 항목 클론

        const lastClone = document.createElement('div');
        lastClone.className = 'project-item';
        lastClone.textContent = projects[0].title; // 첫 번째 항목 클론

        projectWheel.appendChild(firstClone); // 맨 앞에 클론 추가

        for (let i = 0; i < projects.length; i++) {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.textContent = projects[i].title;
            projectWheel.appendChild(item);
        }

        projectWheel.appendChild(lastClone); // 맨 뒤에 클론 추가

        // 초기 위치 설정
        currentTranslate = -ITEM_HEIGHT; // 첫 번째 클론으로 시작
        projectWheel.style.transform = `translateY(${currentTranslate}px)`;
    }

    function updateWheel() {
        const items = document.querySelectorAll('.project-item');
        const centerOffset = (projectList.offsetHeight - ITEM_HEIGHT) / 2;

        // 무한 스크롤을 위한 위치 조정 (애니메이션 없이 즉시 이동)
        if (currentTranslate > ITEM_HEIGHT) {
            projectWheel.style.transition = 'none'; // 애니메이션 제거
            currentTranslate -= (projects.length + 1) * ITEM_HEIGHT;
        } else if (currentTranslate < -(projects.length + 1) * ITEM_HEIGHT) {
            projectWheel.style.transition = 'none'; // 애니메이션 제거
            currentTranslate += (projects.length + 1) * ITEM_HEIGHT;
        }

        const centerPosition = -currentTranslate + centerOffset;

        items.forEach((item, index) => {
            const itemPosition = index * ITEM_HEIGHT;
            const distance = Math.abs(itemPosition - centerPosition);
            
            item.classList.remove('active', 'nearby', 'far');

            const realIndex = (index - 1 + projects.length) % projects.length; // 실제 인덱스 계산
            if (index > 0 && index < items.length - 1) {
                item.textContent = projects[realIndex].title;
            }

            // 현재 위치에 따라 nearby 클래스 추가
            if (Math.abs(itemPosition - centerPosition) < ITEM_HEIGHT / 2) {
                item.classList.add('active');
                currentIndex = realIndex;
            } else if (
                (index === 1 && currentIndex === projects.length - 1) || // 마지막 항목 아래 드래그
                (index === projects.length + 1 && currentIndex === 0) || // 첫 번째 항목 위 드래그
                Math.abs(itemPosition - (centerPosition - ITEM_HEIGHT)) < ITEM_HEIGHT / 2 ||
                Math.abs(itemPosition - (centerPosition + ITEM_HEIGHT)) < ITEM_HEIGHT / 2
            ) {
                item.classList.add('nearby');
            } else {
                item.classList.add('far');
            }
        });

        projectWheel.style.transform = `translateY(${currentTranslate}px)`;
        
        // 강제 리플로우를 통해 transition 스타일 재설정
        projectWheel.offsetHeight;
        projectWheel.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
    }

    function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        isDragging = true;
        prevTranslate = currentTranslate;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        currentTranslate = prevTranslate + diff;

        requestAnimationFrame(updateWheel);
    }

    function handleTouchEnd() {
        isDragging = false;

        // 가장 가까운 항목으로 스냅
        const itemOffset = Math.round(currentTranslate / ITEM_HEIGHT) * ITEM_HEIGHT;

        // 경계 지점에서의 이동인지 확인
        const isAtBoundary = 
            currentTranslate > ITEM_HEIGHT || 
            currentTranslate < -(projects.length + 1) * ITEM_HEIGHT;

        if (!isAtBoundary) {
            projectWheel.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
        } else {
            projectWheel.style.transition = 'none';
        }

        currentTranslate = itemOffset;

        requestAnimationFrame(() => {
            updateWheel();
            if (!isAtBoundary) {
                setTimeout(() => {
                    projectWheel.style.transition = '';
                }, 300);
            }
        });
    }

    projectList.addEventListener('touchstart', handleTouchStart);
    projectList.addEventListener('touchmove', handleTouchMove);
    projectList.addEventListener('touchend', handleTouchEnd);

    // 초기화
    initializeWheel();
    updateWheel();
});
