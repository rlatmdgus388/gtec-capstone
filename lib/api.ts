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