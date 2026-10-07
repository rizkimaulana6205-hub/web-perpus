<?php

namespace App\Http\Middleware;

use App\Models\LibrarySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $currentUser = Auth::user();

        return [
            ...parent::share($request),
            'appName' => config('app.name', 'Perpustakaan Cendekia Nusantara'),
            'settings' => LibrarySetting::current(),
            'auth' => [
                'user' => $currentUser ? [
                    'id' => $currentUser->id,
                    'name' => $currentUser->name,
                    'email' => $currentUser->email,
                    'role' => $currentUser->role,
                    'member_type' => $currentUser->member_type,
                    'identity_number' => $currentUser->identity_number,
                    'class_name' => $currentUser->class_name,
                    'max_loan_limit' => $currentUser->max_loan_limit,
                    'unpaid_fines' => $currentUser->unpaidFinesTotal(),
                    'active_loans_count' => $currentUser->activeLoans()->count(),
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
