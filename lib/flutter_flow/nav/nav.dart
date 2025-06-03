import 'package:flutter/material.dart';
import 'package:gtec_capstone/login_and_register/sign_up/sign_up_widget.dart';
import 'package:gtec_capstone/login_and_register/log_in/log_in_widget.dart';
import 'package:gtec_capstone/login_and_register/home_page/home_page_widget.dart';
import 'package:gtec_capstone/voca_book/select_voca_book/select_voca_book_widget.dart';

class AppRoutes {
  static const String home = '/';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String selectVocaBook = '/select-voca-book';
  
  static Map<String, WidgetBuilder> routes = {
    home: (context) => const HomePageWidget(),
    login: (context) => const LogInWidget(),
    signup: (context) => const SignUpWidget(),
    selectVocaBook: (context) => const SelectVocaBookWidget(),
  };
}

// 라우트 확장 - SignUpWidget에 routeName 대신 사용
extension RouteExtension on Widget {
  static const String routeName = '';
}

// SelectVocaBookWidget에 routeName 추가
extension SelectVocaBookExtension on SelectVocaBookWidget {
  static const String routeName = AppRoutes.selectVocaBook;
}

// HomePageWidget에 routeName 추가
extension HomePageExtension on HomePageWidget {
  static const String routeName = AppRoutes.home;
}

// 컨텍스트 확장 - pushNamed 메서드 추가
extension NavigationExtension on BuildContext {
  Future<T?> pushNamed<T extends Object?>(String routeName, {Object? arguments}) {
    return Navigator.of(this).pushNamed(routeName, arguments: arguments);
  }
}
