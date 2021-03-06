<?php

namespace App\Http\Controllers;
use App\Customer;
use App\Util\UtilFacade;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function save(Request $request) {
        $this->validate($request, array(
            'cust_entry_company' => 'required|max:255',
            'cust_entry_first' => 'required|max:255',
            'cust_entry_last' => 'required|max:255',
            'cust_entry_email' => 'required|max:255|email',
            'cust_entry_addr1' => 'max:255',
            'cust_entry_addr2' => 'max:255',
            'cust_entry_city' => 'max:255',
            'cust_entry_state' => 'alpha',
            'cust_entry_zip' => 'max:11',
            'cust_entry_cell' => 'max:14',
            'cust_entry_office' => 'max:14'
            )
        );

        //Sanitize
        $customer = array();
        $cust_profile = array();

        for($i = 0; $i < count($_POST); $i++) {
            if($i == 0) {
                $customer[substr(key($_POST), 11)] = filter_var(current($_POST), FILTER_SANITIZE_FULL_SPECIAL_CHARS, FILTER_FLAG_NO_ENCODE_QUOTES);
                next($_POST);
            }
            else if($i < 5) {
                $customer[substr(key($_POST), 11)] = filter_var(current($_POST), FILTER_SANITIZE_FULL_SPECIAL_CHARS, FILTER_FLAG_NO_ENCODE_QUOTES);
                next($_POST);
            }
            else {
                $cust_profile[substr(key($_POST), 11)] = filter_var(current($_POST), FILTER_SANITIZE_FULL_SPECIAL_CHARS, FILTER_FLAG_NO_ENCODE_QUOTES);
                next($_POST);
            }
        }

        // Save customer to database
        $user = Auth::user();
        $id = array_shift($customer);
        $cust = $user->customer()->updateOrCreate(array('id' => $id), $customer);
        $cust->cust_profile()->updateOrCreate(array('cust_id' => $id), $cust_profile);

        //sharing Object cur_user, including user's customers and their billables & trx
        $cur_user = UtilFacade::get_user_data_for_view();

        $message = ($_GET['edit'] == 'true') ? 'The customer was updated.' : 'The customer was added.';
        return response()->json(['message' => $message, 'cur_user'=> $cur_user, 201]);
    }

    /**
     * Deletes a customer record and all of their billables and transactions
     * @param int
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete($cust_id) {
        Customer::destroy($cust_id);
        //sharing Object cur_user, including user's customers and their billables & trx
        $cur_user = UtilFacade::get_user_data_for_view();

        return response()->json(['message' => 'The customer was deleted.', 'cur_user' => $cur_user, 201]);
    }

    public function read(Request $request) {
        $customer = Customer::find($_GET['cust_id']);
        return response()->json(['customer' => $customer, 200]);
    }
}