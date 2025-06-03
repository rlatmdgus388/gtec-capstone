import 'package:flutter/material.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_util.dart';

class LogInModel extends FlutterFlowModel {
  // State fields
  final unfocusNode = FocusNode();
  
  // 컨트롤러 추가
  TextEditingController? emailAddressTextController;
  TextEditingController? passwordTextController;
  
  // 포커스 노드 추가
  FocusNode? emailAddressFocusNode;
  FocusNode? passwordFocusNode;
  
  // 유효성 검사 함수
  String? Function(BuildContext, String?)? emailAddressTextControllerValidator;
  String? Function(BuildContext, String?)? passwordTextControllerValidator;

  /// Initialization and disposal methods.
  @override
  void initState(BuildContext context) {
    emailAddressTextControllerValidator = _emailAddressTextControllerValidator;
    passwordTextControllerValidator = _passwordTextControllerValidator;
  }

  @override
  void dispose() {
    unfocusNode.dispose();
    emailAddressTextController?.dispose();
    passwordTextController?.dispose();
    emailAddressFocusNode?.dispose();
    passwordFocusNode?.dispose();
  }

  // 유효성 검사 로직
  String? _emailAddressTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return '아이디를 입력해주세요';
    }
    return null;
  }

  String? _passwordTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return '비밀번호를 입력해주세요';
    }
    return null;
  }
}
