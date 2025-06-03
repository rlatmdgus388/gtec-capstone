import 'package:flutter/material.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_util.dart';

class VerificationModel extends FlutterFlowModel {
  // State fields
  final unfocusNode = FocusNode();
  
  // 컨트롤러 추가
  TextEditingController? textController;
  
  // 유효성 검사 함수
  String? Function(BuildContext, String?)? textControllerValidator;

  /// Initialization and disposal methods.
  @override
  void initState(BuildContext context) {
    textControllerValidator = _textControllerValidator;
  }

  @override
  void dispose() {
    unfocusNode.dispose();
    textController?.dispose();
  }

  // 유효성 검사 로직
  String? _textControllerValidator(BuildContext context, String? val) {
    return null;
  }
}
