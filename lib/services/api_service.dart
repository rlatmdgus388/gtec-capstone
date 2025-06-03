import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:html' as html; // 웹 환경에서 localStorage 사용

// API 서버 기본 URL - 환경 변수로 변경
String getBaseUrl() {
  // Flutter 웹에서 환경 변수 가져오기
  const defaultUrl = 'http://localhost:8000/api';
  
  // 환경 변수가 설정되어 있으면 사용, 아니면 기본값
  return const String.fromEnvironment('API_BASE_URL', defaultValue: defaultUrl);
}

// 토큰 저장 함수 (웹 환경 최적화)
Future<void> saveToken(String token) async {
  try {
    // 웹 환경에서는 localStorage 사용
    html.window.localStorage['access_token'] = token;
    
    // 백업으로 SharedPreferences도 사용
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', token);
  } catch (e) {
    print('토큰 저장 오류: $e');
  }
}

// 토큰 가져오기 함수
String? getToken() {
  try {
    // 웹 환경에서는 localStorage에서 먼저 확인
    final token = html.window.localStorage['access_token'];
    return token;
  } catch (e) {
    print('토큰 조회 오류: $e');
    return null;
  }
}

// 회원가입 함수
Future<String?> register({
  required String userId,
  required String nickname,
  required String password,
  required String passwordConfirm,
}) async {
  try {
    final baseUrl = getBaseUrl();
    final response = await http.post(
      Uri.parse('$baseUrl/auth/signup'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'user_id': userId,
        'nickname': nickname,
        'password': password,
        'password_confirm': passwordConfirm,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return null; // 성공
    } else {
      final errorData = jsonDecode(response.body);
      return errorData['detail'] ?? '회원가입 중 오류가 발생했습니다.';
    }
  } catch (e) {
    return '네트워크 오류: $e';
  }
}

// 로그인 함수
Future<String?> login(String userId, String password) async {
  try {
    final baseUrl = getBaseUrl();
    // OAuth2 형식으로 요청 (form-data)
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'username': userId, // OAuth2 표준에 따라 username 필드 사용
        'password': password,
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      
      // 토큰 저장 - 개선된 방식 사용
      await saveToken(data['access_token']);
      
      return null; // 성공
    } else {
      final errorData = jsonDecode(response.body);
      return errorData['detail'] ?? '로그인 실패: 아이디 또는 비밀번호를 확인하세요.';
    }
  } catch (e) {
    return '네트워크 오류: $e';
  }
}

// 아이디 중복 확인 함수
Future<Map<String, dynamic>> checkUserId(String userId) async {
  try {
    final baseUrl = getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/auth/check-userid?user_id=$userId'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      return {
        'available': false,
        'message': '서버 오류가 발생했습니다.'
      };
    }
  } catch (e) {
    return {
      'available': false,
      'message': '네트워크 오류가 발생했습니다.'
    };
  }
}
