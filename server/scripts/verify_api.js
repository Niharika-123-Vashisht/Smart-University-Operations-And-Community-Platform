// Automated backend API verification script
import http from 'http';

const BASE_URL = 'http://localhost:5000';

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  console.log('--- STARTING BACKEND REST API VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${extra}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', '1. GET /api/health returns 200 Healthy');

    // 2. Student login
    const studentLogin = await request('POST', '/api/auth/login', {
      email: 'student@university.edu',
      password: 'password123',
    });
    assert(studentLogin.status === 200 && studentLogin.body.token, '2. Student Login returns JWT token');
    const studentToken = studentLogin.body.token;

    // 3. Faculty login
    const facultyLogin = await request('POST', '/api/auth/login', {
      email: 'rajesh.sharma@university.edu',
      password: 'password123',
    });
    assert(facultyLogin.status === 200 && facultyLogin.body.user.role === 'faculty', '3. Faculty Login returns role="faculty"');
    const facultyToken = facultyLogin.body.token;

    // 4. Admin login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@university.edu',
      password: 'password123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', '4. Admin Login returns role="admin"');
    const adminToken = adminLogin.body.token;

    // 5. RBAC security check: Student attempting to access admin analytics
    const forbiddenCheck = await request('GET', '/api/analytics/dashboard', null, studentToken);
    assert(forbiddenCheck.status === 403, '5. RBAC Guard: Student access to Admin Analytics is blocked (403 Forbidden)');

    // 6. Student complaints
    const complaints = await request('GET', '/api/complaints', null, studentToken);
    assert(complaints.status === 200 && Array.isArray(complaints.body.complaints), '6. Student can fetch personal grievances list');

    // 7. Faculty appointments
    const facultySlots = await request('GET', '/api/appointments/my', null, facultyToken);
    assert(facultySlots.status === 200 && Array.isArray(facultySlots.body.appointments), '7. Faculty can fetch appointments');

    // 8. Admin analytics aggregation
    const analytics = await request('GET', '/api/analytics/dashboard', null, adminToken);
    const hasData =
      analytics.status === 200 &&
      analytics.body.analytics &&
      analytics.body.analytics.users &&
      analytics.body.analytics.complaints.statusBreakdown;
    assert(hasData, '8. Admin Analytics returns live MongoDB aggregations for Recharts');

    console.log('----------------------------------------------');
    console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log('----------------------------------------------');

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err.message);
    process.exit(1);
  }
};

runTests();
