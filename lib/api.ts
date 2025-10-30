import { auth } from './firebase';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('사용자 인증이 필요합니다.');
  }
  const token = await user.getIdToken();

  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'API 요청에 실패했습니다.');
  }

  // DELETE와 같이 내용이 없는 응답 처리
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

/**
 * [추가된 부분]
 * study-history-screen에서 사용할 학습 세션 목록을 가져오는 함수입니다.
 * /api/study-sessions 엔드포인트를 GET 방식으로 호출합니다.
 */
export const fetchStudySessions = async () => {
  return fetchWithAuth('/api/study-sessions', {
    method: 'GET',
  });
};

// --- 👇 여기부터 export가 누락되었던 함수들입니다. ---

// 단어장 목록 가져오기
export const fetchWordbooks = async () => {
  return fetchWithAuth('/api/wordbooks', {
    method: 'GET',
  });
};

// 단어장 생성
export const createWordbook = async (title: string, description: string) => {
  return fetchWithAuth('/api/wordbooks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  });
};

// 단어장 수정
export const updateWordbook = async (wordbookId: string, title: string, description: string) => {
  return fetchWithAuth(`/api/wordbooks/${wordbookId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description }),
  });
};

// 단어장 삭제
export const deleteWordbook = async (wordbookId: string) => {
  return fetchWithAuth(`/api/wordbooks/${wordbookId}`, {
    method: 'DELETE',
  });
};

// 단어 목록 가져오기
export const fetchWords = async (wordbookId: string) => {
  return fetchWithAuth(`/api/wordbooks/${wordbookId}/words`, {
    method: 'GET',
  });
};

// 단어 추가
export const addWord = async (wordbookId: string, word: string, meaning: string) => {
  return fetchWithAuth(`/api/wordbooks/${wordbookId}/words`, {
    method: 'POST',
    body: JSON.stringify({ word, meaning }),
  });
};

// 단어 수정
export const updateWord = async (wordbookId: string, wordId: string, word: string, meaning: string) => {
  return fetchWithAuth(`/api/wordbooks/${wordbookId}/words/${wordId}`, {
    method: 'PUT',
    body: JSON.stringify({ word, meaning }),
  });
};

// 단어 삭제
export const deleteWord = async (wordbookId: string, wordId: string) => {
  return fetchWithAuth(`/api/wordbooks/${wordbookId}/words/${wordId}`, {
    method: 'DELETE',
  });
};

// (추가) 단어 이동
export const moveWords = async (sourceWordbookId: string, targetWordbookId: string, wordIds: string[]) => {
  return fetchWithAuth('/api/wordbooks/move-words', {
    method: 'POST',
    body: JSON.stringify({ sourceWordbookId, targetWordbookId, wordIds }),
  });
};


// --- Community API ---

// 공유 단어장 목록 가져오기
export const fetchSharedWordbooks = async (sortBy: string = 'createdAt') => {
  return fetchWithAuth(`/api/community/wordbooks?sortBy=${sortBy}`, {
    method: 'GET',
  });
};

// 토론 목록 가져오기
export const fetchDiscussions = async (sortBy: string = 'createdAt') => {
  return fetchWithAuth(`/api/community/discussions?sortBy=${sortBy}`, {
    method: 'GET',
  });
};

// --- (이하 Community 관련 함수들... 예시) ---

// 학습 통계 가져오기
export const fetchLearningStats = async () => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const response = await fetch('/api/learning-stats', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '학습 통계를 불러오는 데 실패했습니다.');
  }
  return response.json();
};

// 학습 세션 생성
export const createStudySession = async (sessionData: {
  wordbookId: string;
  wordIds: string[];
  mode: string;
  totalWords: number;
  correctWords: number;
  incorrectWords: number;
  duration: number; // 초 단위
}) => {
  return fetchWithAuth('/api/study-sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
};

// 학습 세션 상세 정보 가져오기
export const fetchStudySessionDetails = async (sessionId: string) => {
  return fetchWithAuth(`/api/study-sessions/${sessionId}`, {
    method: 'GET',
  });
};


// 프로필 정보 가져오기
export const fetchUserProfile = async () => {
  return fetchWithAuth('/api/user/profile', {
    method: 'GET',
  });
};

// 프로필 정보 업데이트
export const updateUserProfile = async (displayName: string) => {
  return fetchWithAuth('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify({ displayName }),
  });
};

// OCR 요청
export const processImageOCR = async (base64Image: string) => {
  // OCR 요청은 인증이 필요 없을 수 있으나, fetchWithAuth를 사용하면 토큰이 포함됨.
  // 만약 인증이 필요 없다면 일반 fetch를 사용해야 함.
  // 여기서는 fetchWithAuth를 사용한다고 가정.
  return fetchWithAuth('/api/ocr', {
    method: 'POST',
    body: JSON.stringify({ image: base64Image }),
  });
};