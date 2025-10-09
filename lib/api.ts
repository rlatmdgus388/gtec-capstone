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