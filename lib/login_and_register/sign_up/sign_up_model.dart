import '/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';

class SignUpModel extends FlutterFlowModel {
  // State fields
  final unfocusNode = FocusNode();
  
  // 컨트롤러 추가
  TextEditingController? emailAddressController;
  TextEditingController? nicknameTextController;
  TextEditingController? passwordTextController;
  TextEditingController? confirmPasswordTextController;
  
  // 유효성 검사 함수
  String? Function(BuildContext, String?)? emailAddressControllerValidator;
  String? Function(BuildContext, String?)? nicknameTextControllerValidator;
  String? Function(BuildContext, String?)? passwordTextControllerValidator;
  String? Function(BuildContext, String?)? confirmPasswordTextControllerValidator;

  /// Initialization and disposal methods.
  void initState(BuildContext context) {
    emailAddressControllerValidator = _emailAddressControllerValidator;
    nicknameTextControllerValidator = _nicknameTextControllerValidator;
    passwordTextControllerValidator = _passwordTextControllerValidator;
    confirmPasswordTextControllerValidator = _confirmPasswordTextControllerValidator;
  }

  void dispose() {
    unfocusNode.dispose();
    emailAddressController?.dispose();
    nicknameTextController?.dispose();
    passwordTextController?.dispose();
    confirmPasswordTextController?.dispose();
  }

  // 유효성 검사 로직
  String? _emailAddressControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return '아이디를 입력해주세요';
    }
    return null;
  }

  String? _nicknameTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return '닉네임을 입력해주세요';
    }
    return null;
  }

  String? _passwordTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return '비밀번호를 입력해주세요';
    }
    if (val.length < 6) {
      return '비밀번호는 최소 6자 이상이어야 합니다';
    }
    return null;
  }

  String? _confirmPasswordTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return '비밀번호 확인을 입력해주세요';
    }
    if (val != passwordTextController?.text) {
      return '비밀번호가 일치하지 않습니다';
    }
    return null;
  }
}
