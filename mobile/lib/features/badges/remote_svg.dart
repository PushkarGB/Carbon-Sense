import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../core/api/api_client.dart';

final svgStringProvider = FutureProvider.family<String, String>((ref, url) async {
  if (url.isEmpty) return '';
  final dio = ref.watch(dioProvider);
  final res = await dio.get<String>(url);
  var svgData = res.data ?? '';

  // flutter_svg crashes or drops nodes that contain complex filters.
  // We strip out unsupported filters so the core shapes still render.
  svgData = svgData.replaceAll(RegExp(r'filter="[^"]*"'), '');
  svgData = svgData.replaceAll(RegExp(r'<filter[\s\S]*?</filter>'), '');

  // Convert nested <svg> tags to <g> to bypass flutter_svg nested viewBox limitations.
  svgData = svgData.replaceAllMapped(
    RegExp(r'<svg\s+x="([\d.]+)"\s+y="([\d.]+)"\s+width="([\d.]+)"\s+height="([\d.]+)"\s+viewBox="0\s+0\s+([\d.]+)\s+([\d.]+)"[^>]*>'),
    (match) {
      final x = double.parse(match.group(1)!);
      final y = double.parse(match.group(2)!);
      final width = double.parse(match.group(3)!);
      final vWidth = double.parse(match.group(5)!);
      final scaleX = width / vWidth;
      return '<g transform="translate($x, $y) scale($scaleX)">';
    },
  );

  // Replace closing tags
  svgData = svgData.replaceAll('</svg>', '</g>');
  final lastG = svgData.lastIndexOf('</g>');
  if (lastG != -1) {
    svgData = svgData.substring(0, lastG) + '</svg>' + svgData.substring(lastG + 4);
  }

  return svgData;
});

class RemoteSvg extends ConsumerWidget {
  const RemoteSvg({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.contain,
    this.colorFilter,
    this.placeholder,
  });

  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final ColorFilter? colorFilter;
  final WidgetBuilder? placeholder;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (imageUrl.isEmpty) {
      return placeholder?.call(context) ?? const SizedBox.shrink();
    }

    final asyncSvg = ref.watch(svgStringProvider(imageUrl));

    return asyncSvg.when(
      data: (svgString) {
        if (svgString.isEmpty) {
          return placeholder?.call(context) ?? const SizedBox.shrink();
        }
        return SvgPicture.string(
          svgString,
          width: width,
          height: height,
          fit: fit,
          colorFilter: colorFilter,
          placeholderBuilder: placeholder,
        );
      },
      loading: () => placeholder?.call(context) ?? const SizedBox.shrink(),
      error: (e, st) => placeholder?.call(context) ?? const SizedBox.shrink(),
    );
  }
}
