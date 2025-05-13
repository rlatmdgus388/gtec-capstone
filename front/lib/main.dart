import 'dart:math';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:bitsdojo_window/bitsdojo_window.dart';
import 'package:codia_demo_flutter/codia_page.dart';

void main() {
  runApp(const MyApp());

  if (Platform.isMacOS) {
    const winSize = Size(415, 800);
    appWindow.size = winSize;
    appWindow.show();
    doWhenWindowReady(() {
      final win = appWindow;
      win.size = winSize;
      win.alignment = Alignment.center;
      win.show();
    });
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    var paqe = Platform.isMacOS ? const MacOSPage() : SingleChildScrollView(child: CodiaPage());
    return MaterialApp(
      title: 'CodiaDemoFlutter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: paqe,
    );
  }
}

class MacOSPage extends StatefulWidget {
  const MacOSPage({super.key});

  @override
  State<StatefulWidget> createState() => _MacOSPage();
}

class _MacOSPage extends State<MacOSPage> {
  final ScrollController _horizontalScrollController = ScrollController();
  final ScrollController _verticalScrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return Builder(builder: (BuildContext context) {
      MediaQueryData mediaQueryData = MediaQuery.of(context);
      Size codiaPageSize = const Size(415, 800);
      Size windowSize = mediaQueryData.size;
      double widthScale = windowSize.width / codiaPageSize.width;
      double heightScale = windowSize.height / codiaPageSize.height;
      double scale = [1.0, widthScale, heightScale].reduce(max);

      return Scrollbar(
        controller: _verticalScrollController,
        thumbVisibility: true,
        notificationPredicate: (ScrollNotification notification) => notification.depth == 1,
        child: Scrollbar(
          controller: _horizontalScrollController,
          thumbVisibility: true,
          child: Transform.scale(
            scale: scale,
            alignment: Alignment.topLeft,
            child: OverflowBox(
              alignment: Alignment.topLeft,
              child: SingleChildScrollView(
                controller: _horizontalScrollController,
                scrollDirection: Axis.horizontal,
                child: SizedBox(
                  width: codiaPageSize.width,
                  height: codiaPageSize.height,
                  child: SingleChildScrollView(
                    controller: _verticalScrollController,
                    scrollDirection: Axis.vertical,
                    child: CodiaPage(),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    });
  }
}
