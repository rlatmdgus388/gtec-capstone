import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:ff_theme/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'main_laerning_page_model.dart';
export 'main_laerning_page_model.dart';

class MainLaerningPageWidget extends StatefulWidget {
  const MainLaerningPageWidget({super.key});

  static String routeName = 'MainLaerningPage';
  static String routePath = '/mainLaerningPage';

  @override
  State<MainLaerningPageWidget> createState() => _MainLaerningPageWidgetState();
}

class _MainLaerningPageWidgetState extends State<MainLaerningPageWidget> {
  late MainLaerningPageModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => MainLaerningPageModel());
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: Colors.white,
        body: SafeArea(
          top: true,
          child: Stack(
            children: [
              Align(
                alignment: AlignmentDirectional(-1.0, -1.0),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(30.0, 0.0, 0.0, 0.0),
                  child: Text(
                    '학습',
                    style: FlutterFlowTheme.of(context).bodyMedium.override(
                          fontFamily: 'wow',
                          fontSize: 24.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(-0.8, -0.81),
                child: FFButtonWidget(
                  onPressed: () {
                    print('Button pressed ...');
                  },
                  text: '받아쓰기',
                  icon: FaIcon(
                    FontAwesomeIcons.pen,
                    color: FlutterFlowTheme.of(context).primary,
                    size: 15.0,
                  ),
                  options: FFButtonOptions(
                    width: 165.0,
                    height: 110.0,
                    padding:
                        EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    iconAlignment: IconAlignment.start,
                    iconPadding: EdgeInsets.all(0.0),
                    color: Color(0xFFF1F1F1),
                    textStyle: FlutterFlowTheme.of(context).titleSmall.override(
                          fontFamily: 'wow',
                          color: FlutterFlowTheme.of(context).primaryText,
                          fontSize: 14.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                    elevation: 0.0,
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(0.82, -0.81),
                child: FFButtonWidget(
                  onPressed: () {
                    print('Button pressed ...');
                  },
                  text: '객관식퀴즈',
                  icon: Icon(
                    Icons.quiz,
                    color: FlutterFlowTheme.of(context).primary,
                    size: 30.0,
                  ),
                  options: FFButtonOptions(
                    width: 165.0,
                    height: 110.0,
                    padding:
                        EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    iconPadding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                    color: Color(0xFFF1F1F1),
                    textStyle: FlutterFlowTheme.of(context).titleSmall.override(
                          fontFamily: 'wow',
                          color: FlutterFlowTheme.of(context).primaryText,
                          fontSize: 14.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                    elevation: 0.0,
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(-0.8, -0.4),
                child: FFButtonWidget(
                  onPressed: () {
                    print('Button pressed ...');
                  },
                  text: '플래시카드',
                  icon: Icon(
                    Icons.auto_awesome_motion,
                    color: FlutterFlowTheme.of(context).primary,
                    size: 30.0,
                  ),
                  options: FFButtonOptions(
                    width: 165.0,
                    height: 110.0,
                    padding:
                        EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    iconPadding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                    color: Color(0xFFF1F1F1),
                    textStyle: FlutterFlowTheme.of(context).titleSmall.override(
                          fontFamily: 'wow',
                          color: FlutterFlowTheme.of(context).primaryText,
                          fontSize: 14.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                    elevation: 0.0,
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(0.82, -0.4),
                child: FFButtonWidget(
                  onPressed: () {
                    print('Button pressed ...');
                  },
                  text: '자동재생',
                  icon: Icon(
                    Icons.play_arrow_rounded,
                    color: FlutterFlowTheme.of(context).primary,
                    size: 35.0,
                  ),
                  options: FFButtonOptions(
                    width: 165.0,
                    height: 110.0,
                    padding:
                        EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    iconPadding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                    color: Color(0xFFF1F1F1),
                    textStyle: FlutterFlowTheme.of(context).titleSmall.override(
                          fontFamily: 'wow',
                          color: FlutterFlowTheme.of(context).primaryText,
                          fontSize: 14.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                    elevation: 0.0,
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
