import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:html' as html;

// 환경 변수에서 백엔드 URL 가져오기 - api_service.dart와 일치시킴
String getBaseUrl() {
  const defaultUrl = 'http://localhost:8000';
  return const String.fromEnvironment('API_BASE_URL', defaultValue: defaultUrl);
}

// 토큰 저장 함수 (웹 환경 최적화)
void saveToken(String token) {
  try {
    // 웹 환경에서는 localStorage 사용
    html.window.localStorage['access_token'] = token;
  } catch (e) {
    print('토큰 저장 오류: $e');
  }
}

// 토큰 가져오기 함수
String? getToken() {
  try {
    // 웹 환경에서는 localStorage에서 확인
    return html.window.localStorage['access_token'];
  } catch (e) {
    print('토큰 조회 오류: $e');
    return null;
  }
}

Future<String?> login(String id, String pwd) async {
  try {
    final baseUrl = getBaseUrl();
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'grant_type': 'password',
        'username': id,
        'password': pwd,
      },
    );

    if (res.statusCode == 200) {
      final token = json.decode(res.body)['access_token'] as String;
      saveToken(token);
      return null; // 성공
    }
    
    // 오류 응답 처리 개선
    if (res.statusCode == 401) {
      return '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
    
    try {
      final errorData = jsonDecode(res.body);
      return errorData['detail'] ?? '로그인 실패 (${res.statusCode})';
    } catch (e) {
      return '로그인 실패 (${res.statusCode})';
    }
  } catch (e) {
    return '네트워크 오류: $e';
  }
}

// 토큰이 필요하면 authHeader로 불러서 사용
Map<String, String> get authHeader {
  final token = getToken();
  return token == null ? {} : {'Authorization': 'Bearer $token'};
}
