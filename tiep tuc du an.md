# TIẾP TỤC DỰ ÁN — IPTV webOS / Iptvwebos

## 2026-10-01 — Handover tổng hợp

### Mục tiêu dự án
- Xây app IPTV cho LG webOS, ưu tiên webOS 4.x trở lên.
- Giao diện theo hướng tương tự TiviMate.
- Khắc phục hạn chế của nhiều app IPTV trên LG/Samsung: thường chỉ cho nhập rất ít playlist/link.
- App phải cho người dùng thêm nhiều nguồn M3U/playlist, không phụ thuộc số lượng nguồn vào một backend chung.
- Mục tiêu tương thích: Direct playback trước; khi TV không phát được thì dùng fallback backend tùy chọn.
- Không để backend Render trở thành yêu cầu bắt buộc đối với mọi người dùng.

### Kiến trúc đã thống nhất
1. Direct trên TV là đường mặc định.
2. Private Fallback là tùy chọn, người dùng nâng cao có thể nhập URL backend Render của chính họ.
3. Backend không được mặc định trỏ vào Render của chủ dự án.
4. Backend dùng để resolve/remux/transcode khi stream không tương thích native với webOS.
5. Không dùng backend chung để phục vụ tất cả người dùng vì sẽ làm tăng CPU/băng thông và tạo bottleneck.

### Render / backend
- Repo: https://github.com/chuongnguyen89dn-ui/Iptvwebos
- Backend service Render: iptvwebos / iptvwebos-fallback.
- Backend đã chuyển sang Docker để có FFmpeg.
- Dockerfile nằm tại backend/Dockerfile.
- Docker image dùng Node 20 Bookworm Slim và cài FFmpeg.
- Render từng gặp lỗi Build Context/Dockerfile Path; đã xử lý.
- Backend đã xác nhận FFmpeg 5.1.9 chạy thật trên Render.
- Port Render được backend nhận qua biến PORT.

### Các endpoint fallback
- /health: kiểm tra backend/FFmpeg.
- /resolve: nhận URL stream, kiểm tra/resolve redirect và trả thông tin URL/kind/status/type.
- /remux: FFmpeg đọc stream và copy codec, xuất MPEG-TS.
- /transcode: FFmpeg transcode H.264/AAC, xuất MPEG-TS.
- /selftest: đã dùng trong giai đoạn kiểm thử nhưng đã bỏ khỏi public backend để tránh tốn tài nguyên.
- Startup hiện chỉ kiểm tra FFmpeg, không tự chạy remux/transcode mỗi lần restart.

### Kết quả kiểm thử backend
- FFmpeg: PASS — 5.1.9.
- HLS manifest probe: PASS.
- Manifest test có các profile tới 1080p.
- Remux thực tế: PASS; đã xuất dữ liệu MPEG-TS, một lần đo khoảng 246,092 bytes.
- Transcode thực tế: FFmpeg đã xuất dữ liệu H.264/AAC; một lần test nhận 72,192 bytes nhưng harness cũ timeout trước khi process tự kết thúc.
- Đã sửa harness: khi nhận đủ 65,536 bytes thì dừng FFmpeg và tính PASS.
- Sau sửa, remux và transcode đều đã được báo PASS trong môi trường Render.
- Điều này chứng minh FFmpeg backend có khả năng xử lý HLS thật; chưa đồng nghĩa mọi loại IPTV URL đều được hỗ trợ.
- HTTP endpoint production từ môi trường kiểm tra bên ngoài từng không truy cập trực tiếp được, vì vậy không được ghi là đã xác minh production HTTP request nếu chưa có log/request thật tương ứng.

### Bảo mật / SSRF
- Đã thêm kiểm tra URL và chặn host/IP private/local cơ bản.
- Có xử lý localhost, metadata.google.internal, loopback, link-local, RFC1918 và một số IPv6 private/local.
- Đã phát hiện regex IPv4 bị escape sai và sửa lại.
- Không được bỏ SSRF protection khi mở rộng resolver.
- Redirect phải được kiểm tra lại từng hop, không chỉ kiểm tra URL đầu tiên.

### Lỗi và sự cố đã gặp
1. Render Node native không có FFmpeg → chuyển backend sang Docker.
2. Dockerfile path sai → sửa Dockerfile/build context.
3. Self-test gọi nhầm probe() → gây ReferenceError, sau đó sửa.
4. Startup test remux/transcode gây tốn tài nguyên → đã bỏ.
5. Một lần dọn code vô tình làm mất /resolve, /remux, /transcode → đã khôi phục.
6. SSRF private-IP regex sai → đã sửa.
7. Không được coi HTTP endpoint production PASS chỉ vì /health hoặc startup log PASS.

### App frontend
- App webOS cần giữ Direct playback là mặc định.
- Fallback URL phải để trống mặc định.
- Settings có mục Private Fallback, người dùng có thể tự nhập backend của họ.
- Không ép người dùng đăng ký Render chỉ để sử dụng app.
- App cần hỗ trợ nhiều playlist/source M3U.
- Cần ưu tiên parser M3U robust, group/category, URL có query/header, redirect và HLS.
- Khi Direct thất bại nên thử fallback chain: DIRECT → RESOLVE → REMUX → TRANSCODE.
- Không tự transcode tất cả stream vì tốn tài nguyên và làm tăng latency.
- Chỉ fallback khi Direct không phát được hoặc URL cần xử lý mà webOS không làm được.

### Chưa hoàn thành
- Chưa có bằng chứng đầy đủ rằng mọi loại IPTV link thực tế đều phát được.
- Chưa hoàn tất test production endpoint với URL IPTV thực tế từ một client ngoài Render.
- Chưa hoàn tất tích hợp fallback chain vào player frontend và test trên TV LG thật.
- Chưa build/phát hành IPK cuối cùng sau toàn bộ thay đổi backend.
- Chưa xác nhận tương thích đầy đủ trên từng phiên bản webOS 4.x+.
- Cần kiểm tra CORS, Range request, Content-Type, redirect, timeout, reconnect và live-stream behavior.
- Cần kiểm tra CPU/RAM khi nhiều stream remux/transcode đồng thời.
- NPM trước đó báo 4 vulnerabilities (2 moderate, 2 high); cần xử lý/đánh giá trước release, nhưng không tự nâng dependency gây breaking change mà chưa test.

### Nguyên tắc tiếp tục dự án
- Không viết lại phần đã hoạt động nếu không cần.
- Sau mỗi thay đổi: build/deploy → kiểm tra deploy state → kiểm tra runtime logs → nếu lỗi thì sửa và kiểm tra lại.
- Không báo done, LIVE, deploy thành công nếu chưa có bằng chứng từ deploy/log.
- Không xóa lịch sử handover; chỉ bổ sung phần mới và tránh trùng lặp.
- Khi test stream, phân biệt rõ: manifest reachable; media segments reachable; remux output có bytes; transcode output có bytes; player webOS thực sự phát được hình/tiếng.
- Backend là fallback tùy chọn, không phải kiến trúc bắt buộc cho tất cả người dùng.

## Trạng thái hiện tại
Backend Docker + FFmpeg đã được dựng và các bài kiểm thử FFmpeg/HLS/remux/transcode đã có kết quả thực tế. Frontend vẫn cần tích hợp fallback chain và cần test endpoint production/client thật trước khi phát hành IPK cuối cùng.