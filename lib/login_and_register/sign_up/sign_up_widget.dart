import 'package:flutter/material.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_theme.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_util.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_widgets.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_icon_button.dart';
import 'package:gtec_capstone/flutter_flow/nav/nav.dart';
import 'package:gtec_capstone/login_and_register/home_page/home_page_widget.dart';
import 'package:gtec_capstone/voca_book/select_voca_book/select_voca_book_widget.dart';
import 'package:gtec_capstone/services/api_service.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'sign_up_model.dart';
import 'package:gtec_capstone/login_and_register/log_in/log_in_widget.dart';

class SignUpWidget extends StatefulWidget {
  const SignUpWidget({Key? key}) : super(key: key);

  static const String routeName = 'SignUp';
  static const String routePath = '/signup';

  @override
  _SignUpWidgetState createState() => _SignUpWidgetState();
}

class _SignUpWidgetState extends State<SignUpWidget> {
  late SignUpModel _model;
  final _formKey = GlobalKey<FormState>();
  
  // 컨트롤러 선언
  late TextEditingController _idController;
  late TextEditingController _nicknameController;
  late TextEditingController _passwordController;
  late TextEditingController _confirmPasswordController;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel<SignUpModel>(context, () => SignUpModel());

    // 컨트롤러 초기화
    _model.emailAddressController ??= TextEditingController();
    _model.nicknameTextController ??= TextEditingController();
    _model.passwordTextController ??= TextEditingController();
    _model.confirmPasswordTextController ??= TextEditingController();
    
    // 컨트롤러 연결
    _idController = _model.emailAddressController!;
    _nicknameController = _model.nicknameTextController!;
    _passwordController = _model.passwordTextController!;
    _confirmPasswordController = _model.confirmPasswordTextController!;
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).requestFocus(_model.unfocusNode),
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: Colors.white,
        body: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // 상단: 이전화면 버튼 + 회원가입 텍스트
                  Align(
                    alignment: AlignmentDirectional(-1.0, -1.0),
                    child: Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(10.0, 0.0, 0.0, 0.0),
                      child: FlutterFlowIconButton(
                        borderColor: Colors.transparent,
                        borderRadius: 30.0,
                        borderWidth: 1.0,
                        buttonSize: 40.0,
                        icon: Icon(
                          Icons.arrow_back_ios_rounded,
                          color: Color(0xFFF38F38),
                          size: 20.0,
                        ),
                        onPressed: () async {
                          Navigator.pushNamed(context, HomePageWidget.routeName);
                        },
                      ),
                    ),
                  ),
                  Align(
                    alignment: AlignmentDirectional(0.0, -1.0),
                    child: Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                      child: Text(
                        '회원가입',
                        style: (FlutterFlowTheme.of(context).bodyLarge ?? const TextStyle()).copyWith(
                          fontFamily: 'wow',
                          fontSize: 24.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 16.0),
                  // 아이디
                  TextFormField(
                    controller: _model.emailAddressController,
                    obscureText: false,
                    decoration: InputDecoration(
                      labelText: '아이디',
                      labelStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      hintText: '아이디를 입력하세요',
                      hintStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFE0E3E7),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFF38F38),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      filled: true,
                      fillColor: FlutterFlowTheme.of(context).secondaryBackground,
                      contentPadding: EdgeInsets.all(24.0),
                    ),
                    style: (FlutterFlowTheme.of(context).bodySmall ?? const TextStyle()).copyWith(
                      fontFamily: 'wow',
                      fontSize: 8.0,
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w300,
                    ),
                    keyboardType: TextInputType.emailAddress,
                    cursorColor: FlutterFlowTheme.of(context).primary,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return '아이디를 입력해주세요';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16.0),
                  // 닉네임
                  TextFormField(
                    controller: _model.nicknameTextController,
                    obscureText: false,
                    decoration: InputDecoration(
                      labelText: '닉네임',
                      labelStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      hintText: '닉네임을 입력하세요',
                      hintStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFE0E3E7),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFF38F38),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      filled: true,
                      fillColor: FlutterFlowTheme.of(context).secondaryBackground,
                      contentPadding: EdgeInsets.all(24.0),
                    ),
                    style: (FlutterFlowTheme.of(context).bodySmall ?? const TextStyle()).copyWith(
                      fontFamily: 'wow',
                      fontSize: 8.0,
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w300,
                    ),
                    cursorColor: FlutterFlowTheme.of(context).primary,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return '닉네임을 입력해주세요';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16.0),
                  // 비밀번호
                  TextFormField(
                    controller: _model.passwordTextController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: '비밀번호',
                      labelStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      hintText: '비밀번호를 입력하세요',
                      hintStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFE0E3E7),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFF38F38),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      filled: true,
                      fillColor: FlutterFlowTheme.of(context).secondaryBackground,
                      contentPadding: EdgeInsets.all(24.0),
                    ),
                    style: (FlutterFlowTheme.of(context).bodySmall ?? const TextStyle()).copyWith(
                      fontFamily: 'wow',
                      fontSize: 8.0,
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w300,
                    ),
                    cursorColor: FlutterFlowTheme.of(context).primary,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return '비밀번호를 입력해주세요';
                      }
                      if (value.length < 6) {
                        return '비밀번호는 최소 6자 이상이어야 합니다';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 16.0),
                  // 비밀번호 확인
                  TextFormField(
                    controller: _model.confirmPasswordTextController,
                    obscureText: true,
                    decoration: InputDecoration(
                      labelText: '비밀번호 확인',
                      labelStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      hintText: '비밀번호를 다시 입력하세요',
                      hintStyle: (FlutterFlowTheme.of(context).labelMedium ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Color(0xFF8B97A2),
                        fontSize: 8.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w300,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFE0E3E7),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: Color(0xFFF38F38),
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: FlutterFlowTheme.of(context).error,
                          width: 2.0,
                        ),
                        borderRadius: BorderRadius.circular(40.0),
                      ),
                      filled: true,
                      fillColor: FlutterFlowTheme.of(context).secondaryBackground,
                      contentPadding: EdgeInsets.all(24.0),
                    ),
                    style: (FlutterFlowTheme.of(context).bodySmall ?? const TextStyle()).copyWith(
                      fontFamily: 'wow',
                      fontSize: 8.0,
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w300,
                    ),
                    keyboardType: TextInputType.emailAddress,
                    cursorColor: FlutterFlowTheme.of(context).primary,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return '비밀번호 확인을 입력해주세요';
                      }
                      if (value != _passwordController.text) {
                        return '비밀번호가 일치하지 않습니다';
                      }
                      return null;
                    },
                  ),
                  SizedBox(height: 32.0),
                  FFButtonWidget(
                    onPressed: () async {
                      // 폼 검증
                      if (!_formKey.currentState!.validate()) {
                        return;
                      }
                      // 회원가입 API 호출
                      final error = await register(
                        userId: _idController.text.trim(),
                        nickname: _nicknameController.text.trim(),
                        password: _passwordController.text,
                        passwordConfirm: _confirmPasswordController.text,
                      );
                      // 결과 처리
                      if (error == null) {
                        // 회원가입 성공 - 로그인 페이지로 이동
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('회원가입이 완료되었습니다. 로그인해주세요.')),
                        );
                        if (context.mounted) {
                          Navigator.pushNamed(context, LogInWidget.routeName);
                        }
                      } else {
                        // 회원가입 실패 - 오류 메시지 표시
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(error)),
                        );
                      }
                    },
                    text: '완료',
                    options: FFButtonOptions(
                      width: 340.0,
                      height: 48.0,
                      padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: Color(0xFFF38F38),
                      textStyle: (FlutterFlowTheme.of(context).titleSmall ?? const TextStyle()).copyWith(
                        fontFamily: 'wow',
                        color: Colors.white,
                        fontSize: 15.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w500,
                      ),
                      elevation: 0.0,
                      borderSide: BorderSide(
                        color: Color(0xFFF38F38),
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(38.0),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
