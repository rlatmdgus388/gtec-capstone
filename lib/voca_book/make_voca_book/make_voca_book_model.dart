import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/index.dart';
import 'make_voca_book_widget.dart' show MakeVocaBookWidget;
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class MakeVocaBookModel extends FlutterFlowModel<MakeVocaBookWidget> {
  ///  State fields for stateful widgets in this page.

  // State field(s) for wowowo widget.
  FocusNode? wowowoFocusNode;
  TextEditingController? wowowoTextController;
  String? Function(BuildContext, String?)? wowowoTextControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    wowowoFocusNode?.dispose();
    wowowoTextController?.dispose();
  }
}
