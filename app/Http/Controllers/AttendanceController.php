<?php

namespace App\Http\Controllers;

use App\Models\AttendanceLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    /**
     * Layar Check-in Mandiri di Pintu Masuk (Kiosk Presensi via Scan Barcode Kartu Siswa).
     */
    public function kiosk(): Response
    {
        $today = Carbon::today();
        $todayLogs = AttendanceLog::whereDate('checkin_at', $today)
            ->latest('checkin_at')
            ->take(10)
            ->get();

        $stats = [
            'today_total' => AttendanceLog::whereDate('checkin_at', $today)->count(),
            'today_siswa' => AttendanceLog::whereDate('checkin_at', $today)->where('visitor_type', 'siswa')->count(),
            'today_guru' => AttendanceLog::whereDate('checkin_at', $today)->where('visitor_type', 'guru')->count(),
            'today_tamu' => AttendanceLog::whereDate('checkin_at', $today)->where('visitor_type', 'tamu')->count(),
        ];

        return Inertia::render('attendance/kiosk', [
            'recentLogs' => $todayLogs,
            'stats' => $stats,
        ]);
    }

    /**
     * Submit Check-in Mandiri (Scan NIS atau Barcode Kartu Pelajar).
     */
    public function checkin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'identity_number' => 'required|string|max:100',
            'visitor_name' => 'nullable|string|max:255',
            'visitor_type' => 'nullable|in:siswa,guru,tamu',
            'class_name' => 'nullable|string|max:100',
            'purpose' => 'required|string|max:255',
        ]);

        $identity = trim($validated['identity_number']);

        // Check if member already in database
        $user = User::where('identity_number', $identity)
            ->orWhere('id', is_numeric($identity) ? (int) $identity : 0)
            ->first();

        $name = $user ? $user->name : ($validated['visitor_name'] ?? 'Pengunjung Tamu');
        $type = $user ? $user->member_type : ($validated['visitor_type'] ?? 'tamu');
        $class = $user ? $user->class_name : ($validated['class_name'] ?? 'Umum');

        $log = AttendanceLog::create([
            'user_id' => $user?->id,
            'identity_number' => $identity,
            'visitor_name' => $name,
            'visitor_type' => $type,
            'class_name' => $class,
            'purpose' => $validated['purpose'],
            'checkin_at' => Carbon::now(),
        ]);

        return back()->with('success', "Selamat datang di perpustakaan, {$name}! Kehadiran Anda berhasil tercatat ({$log->checkin_at->format('H:i:s')} WIB).");
    }

    /**
     * Daftar Log Presensi & Rekap Buku Tamu Digital (Pustakawan/Admin).
     */
    public function index(Request $request): Response
    {
        $query = AttendanceLog::query();

        if ($date = $request->input('date')) {
            $query->whereDate('checkin_at', $date);
        } else {
            // Default to today if not filtered, or all
        }

        if ($type = $request->input('type')) {
            $query->where('visitor_type', $type);
        }

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('visitor_name', 'like', "%{$search}%")
                    ->orWhere('identity_number', 'like', "%{$search}%")
                    ->orWhere('class_name', 'like', "%{$search}%");
            });
        }

        $logs = $query->latest('checkin_at')->paginate(20)->withQueryString();

        $summary = [
            'total_visits' => AttendanceLog::count(),
            'today_visits' => AttendanceLog::whereDate('checkin_at', Carbon::today())->count(),
            'this_month' => AttendanceLog::whereMonth('checkin_at', Carbon::today()->month)->count(),
        ];

        return Inertia::render('attendance/index', [
            'logs' => $logs,
            'filters' => [
                'date' => (string) $request->input('date', ''),
                'type' => (string) $request->input('type', ''),
                'q' => (string) $request->input('q', ''),
            ],
            'summary' => $summary,
        ]);
    }
}
