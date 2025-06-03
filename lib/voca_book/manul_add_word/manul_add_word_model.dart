import 'package:flutter/material.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_util.dart';
import 'package:gtec_capstone/flutter_flow/form_field_controller.dart';

class ManulAddWordModel extends FlutterFlowModel {
  // State fields
  final unfocusNode = FocusNode();
  
  // 컨트롤러 추가
  TextEditingController? textController1;
  TextEditingController? textController2;
  TextEditingController? textController3;
  TextEditingController? textController4;
  FocusNode? textFieldFocusNode1;
  FocusNode? textFieldFocusNode2;
  FocusNode? textFieldFocusNode3;
  FocusNode? textFieldFocusNode4;
  
  // 유효성 검사 함수
  String? Function(BuildContext, String?)? textController1Validator;
  String? Function(BuildContext, String?)? textController2Validator;
  String? Function(BuildContext, String?)? textController3Validator;
  String? Function(BuildContext, String?)? textController4Validator;

  String? droupGroupValue;
  FormFieldController<String>? droupGroupValueController;

  /// Initialization and disposal methods.
  @override
  void initState(BuildContext context) {
    textController1Validator = _textController1Validator;
    textController2Validator = _textController2Validator;
    textController3Validator = _textController3Validator;
    textController4Validator = _textController4Validator;
  }

  @override
  void dispose() {
    unfocusNode.dispose();
    textController1?.dispose();
    textController2?.dispose();
    textController3?.dispose();
    textController4?.dispose();
    textFieldFocusNode1?.dispose();
    textFieldFocusNode2?.dispose();
    textFieldFocusNode3?.dispose();
    textFieldFocusNode4?.dispose();
  }

  // 유효성 검사 로직
  String? _textController1Validator(BuildContext context, String? val) {
    return null;
  }
  
  String? _textController2Validator(BuildContext context, String? val) {
    return null;
  }

  String? _textController3Validator(BuildContext context, String? val) {
    return null;
  }
  
  String? _textController4Validator(BuildContext context, String? val) {
    return null;
  }

  void safeSetState(VoidCallback fn) {
    if (this is ChangeNotifier) {
      fn();
      // ignore: invalid_use_of_protected_member, invalid_use_of_visible_for_testing_member
      (this as ChangeNotifier).notifyListeners();
    } else {
      fn();
    }
  }
}
