import 'package:flutter/material.dart';
import 'package:gtec_capstone/flutter_flow/flutter_flow_theme.dart';
import 'package:gtec_capstone/flutter_flow/nav/nav.dart';
import 'package:gtec_capstone/login_and_register/home_page/home_page_widget.dart';
import 'package:gtec_capstone/login_and_register/sign_up/sign_up_widget.dart';
import 'package:gtec_capstone/login_and_register/log_in/log_in_widget.dart';
import 'package:gtec_capstone/voca_book/select_voca_book/select_voca_book_widget.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FlutterFlowTheme.initialize();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Voca App',
      theme: ThemeData.light().copyWith(
        primaryColor: FlutterFlowTheme.of(context).primary,
        scaffoldBackgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        textTheme: TextTheme(
          displayLarge: FlutterFlowTheme.of(context).displayLarge,
          displayMedium: FlutterFlowTheme.of(context).displayMedium,
          displaySmall: FlutterFlowTheme.of(context).displaySmall,
          headlineLarge: FlutterFlowTheme.of(context).headlineLarge,
          headlineMedium: FlutterFlowTheme.of(context).headlineMedium,
          headlineSmall: FlutterFlowTheme.of(context).headlineSmall,
          titleLarge: FlutterFlowTheme.of(context).titleLarge,
          titleMedium: FlutterFlowTheme.of(context).titleMedium,
          titleSmall: FlutterFlowTheme.of(context).titleSmall,
          labelLarge: FlutterFlowTheme.of(context).labelLarge,
          labelMedium: FlutterFlowTheme.of(context).labelMedium,
          labelSmall: FlutterFlowTheme.of(context).labelSmall,
          bodyLarge: FlutterFlowTheme.of(context).bodyLarge,
          bodyMedium: FlutterFlowTheme.of(context).bodyMedium,
          bodySmall: FlutterFlowTheme.of(context).bodySmall,
        ),
      ),
      darkTheme: ThemeData.dark().copyWith(
        primaryColor: FlutterFlowTheme.of(context).primary,
        scaffoldBackgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        textTheme: TextTheme(
          displayLarge: FlutterFlowTheme.of(context).displayLarge,
          displayMedium: FlutterFlowTheme.of(context).displayMedium,
          displaySmall: FlutterFlowTheme.of(context).displaySmall,
          headlineLarge: FlutterFlowTheme.of(context).headlineLarge,
          headlineMedium: FlutterFlowTheme.of(context).headlineMedium,
          headlineSmall: FlutterFlowTheme.of(context).headlineSmall,
          titleLarge: FlutterFlowTheme.of(context).titleLarge,
          titleMedium: FlutterFlowTheme.of(context).titleMedium,
          titleSmall: FlutterFlowTheme.of(context).titleSmall,
          labelLarge: FlutterFlowTheme.of(context).labelLarge,
          labelMedium: FlutterFlowTheme.of(context).labelMedium,
          labelSmall: FlutterFlowTheme.of(context).labelSmall,
          bodyLarge: FlutterFlowTheme.of(context).bodyLarge,
          bodyMedium: FlutterFlowTheme.of(context).bodyMedium,
          bodySmall: FlutterFlowTheme.of(context).bodySmall,
        ),
      ),
      themeMode: FlutterFlowTheme.themeMode,
      initialRoute: HomePageWidget.routeName,
      routes: {
        HomePageWidget.routeName: (context) => HomePageWidget(),
        SignUpWidget.routeName: (context) => SignUpWidget(),
        LogInWidget.routeName: (context) => LogInWidget(),
        SelectVocaBookWidget.routeName: (context) => SelectVocaBookWidget(),
      },
    );
  }
}
