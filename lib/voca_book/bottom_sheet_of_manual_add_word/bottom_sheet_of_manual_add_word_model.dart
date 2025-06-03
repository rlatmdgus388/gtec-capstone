import 'package:flutter/material.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_util.dart';

class BottomSheetOfManualAddWordModel extends FlutterFlowModel {
  // State fields
  final unfocusNode = FocusNode();
  
  // 컨트롤러 추가
  TextEditingController? textController1;
  TextEditingController? textController2;
  
  // 유효성 검사 함수
  String? Function(BuildContext, String?)? textController1Validator;
  String? Function(BuildContext, String?)? textController2Validator;

  /// Initialization and disposal methods.
  @override
  void initState(BuildContext context) {
    textController1Validator = _textController1Validator;
    textController2Validator = _textController2Validator;
  }

  @override
  void dispose() {
    unfocusNode.dispose();
    textController1?.dispose();
    textController2?.dispose();
  }

  // 유효성 검사 로직
  String? _textController1Validator(BuildContext context, String? val) {
    return null;
  }
  
  String? _textController2Validator(BuildContext context, String? val) {
    return null;
  }

  void onUpdate() {}
  void maybeDispose() {
    dispose();
  }
}
