import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lottie/lottie.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/auth/auth_repository.dart';
import '../../core/cloudinary/cloudinary_uploader.dart';
import '../../core/lottie/lottie_assets.dart';
import 'maharashtra_cities.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  String _role = 'student';
  String? _city;
  XFile? _pickedImage;
  String? _uploadedProfileUrl;
  bool _uploadingImage = false;
  bool _submitting = false;
  String? _errorText;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_city == null) {
      setState(() => _errorText = 'Please select your city.');
      return;
    }
    if (_uploadedProfileUrl == null) {
      setState(() => _errorText = 'Please upload a profile picture.');
      return;
    }

    setState(() {
      _submitting = true;
      _errorText = null;
    });

    try {
      await ref
          .read(authRepositoryProvider)
          .register(
            name: _name.text.trim(),
            email: _email.text.trim(),
            password: _password.text,
            city: _city!,
            role: _role,
            profilePictureUrl: _uploadedProfileUrl!,
          );
      if (!mounted) return;
      context.go('/onboarding');
    } catch (e) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Error'),
          content: Text(e.toString()),
          actions: [
            TextButton(onPressed: () => context.pop(), child: const Text('OK')),
          ],
        ),
      );
      setState(() => _errorText = 'Registration failed. Please try again.');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _pickAndUpload() async {
    setState(() {
      _errorText = null;
      _uploadingImage = true;
    });

    try {
      final picker = ImagePicker();
      final img = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 88,
      );
      if (img == null) {
        setState(() => _uploadingImage = false);
        return;
      }

      setState(() => _pickedImage = img);

      final dio = Dio();
      final uploader = CloudinaryUploader(dio);
      final url = await uploader.uploadProfilePicture(img);

      if (!mounted) return;
      setState(() {
        _uploadedProfileUrl = url;
        _uploadingImage = false;
      });
    } on DioException {
      if (!mounted) return;
      setState(() {
        _uploadingImage = false;
        _errorText =
            'Profile upload failed. Ensure Cloudinary config is set and try again.';
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _uploadingImage = false;
        _errorText = 'Profile upload failed. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Create account')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            SizedBox(
              height: 160,
              child: LottieBuilder.asset(
                LottieAssets.authHero,
                repeat: true,
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _name,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              textInputAction: TextInputAction.next,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _password,
              obscureText: true,
              textInputAction: TextInputAction.done,
              decoration: const InputDecoration(
                labelText: 'Password',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            DropdownMenu<String>(
              label: const Text('City (Maharashtra)'),
              expandedInsets: EdgeInsets.zero,
              requestFocusOnTap: true,
              enableFilter: true,
              enableSearch: true,
              onSelected: (value) => setState(() => _city = value),
              dropdownMenuEntries: maharashtraCities
                  .map((c) => DropdownMenuEntry<String>(value: c, label: c))
                  .toList(growable: false),
            ),
            const SizedBox(height: 12),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'student', label: Text('Student')),
                ButtonSegment(
                  value: 'working_professional',
                  label: Text('Working Professional'),
                ),
                ButtonSegment(value: 'other', label: Text('Other')),
              ],
              selected: {_role},
              onSelectionChanged: (s) => setState(() => _role = s.first),
            ),
            const SizedBox(height: 12),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Profile picture'),
              subtitle: Text(
                _uploadedProfileUrl != null
                    ? 'Uploaded'
                    : _uploadingImage
                    ? 'Uploading…'
                    : 'Pick an image to upload via Cloudinary',
                style: TextStyle(color: cs.onSurfaceVariant),
              ),
              trailing: _uploadingImage
                  ? SizedBox(
                      height: 28,
                      width: 28,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: cs.primary,
                      ),
                    )
                  : const Icon(Icons.cloud_upload_outlined),
              onTap: (_submitting || _uploadingImage) ? null : _pickAndUpload,
            ),
            if (_pickedImage != null) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: Image.file(
                    File(_pickedImage!.path),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ],
            if (_errorText != null) ...[
              const SizedBox(height: 12),
              Text(_errorText!, style: TextStyle(color: cs.error)),
            ],
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _submitting ? null : _submit,
              child: Text(_submitting ? 'Creating…' : 'Create account'),
            ),
          ],
        ),
      ),
    );
  }
}
