<?php

namespace App\Http\Controllers\Auth;

use App\User;
use App\Profile;
use Illuminate\Http\Request as Request;
use Validator;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\ThrottlesLogins;
use Illuminate\Foundation\Auth\AuthenticatesAndRegistersUsers;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesAndRegistersUsers, ThrottlesLogins;

    /**
     * Where to redirect users after login / registration.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware($this->guestMiddleware(), ['except' => ['logout']]);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|min:6|confirmed',
            'password_confirmation' => 'required|min:6'
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data)
    {
        $user = User::create([
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);
        $profile = new Profile(['user_id' => $user->id]);
        $user->profile()->save($profile);
        return $user;
    }

    /**
     * Return response for ajax login
     *
     * @param \Illuminate\Support\Facades\Request $request
     * @param \App\User
     * @return Illuminate\Http\Response
    protected function authenticated(Request $request, $user)
    {
        if($request->wantsJson())
            return response()->json(['ok' => true], 200);
    }

    /**
     * Get the failed login response instance.
     *
     * @param Request $request
     * @return Illuminate\Http\Response
     */
    protected function sendFailedLoginResponse(Request $request)
    {
        if($request->wantsJson())
            return response()->json(['status' => 'Unauthorized', $this->loginUsername() => $this->getFailedLoginMessage(), 'password' => $this->getFailedLoginMessage()], 401);

        return redirect()->back()
            ->withInput($request->only($this->loginUsername(), 'remember'))
            ->withErrors([
                $this->loginUsername() => $this->getFailedLoginMessage(),
            ]);
    }
}
