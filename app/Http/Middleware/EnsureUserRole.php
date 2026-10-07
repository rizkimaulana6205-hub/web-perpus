<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! Auth::check()) {
            return redirect()->route('login')->with('error', 'Silakan masuk terlebih dahulu untuk mengakses menu ini.');
        }

        $user = Auth::user();

        if (! empty($roles) && ! in_array($user->role, $roles)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Anda tidak memiliki hak akses untuk tindakan ini.',
                ], 403);
            }

            $destination = match ($user->role) {
                'anggota' => route('loans.my_loans'),
                'petugas' => route('circulation.index'),
                default => route('home'),
            };

            return redirect($destination)->with('error', 'Akses ditolak: Halaman ini memerlukan hak akses khusus.');
        }

        return $next($request);
    }
}
