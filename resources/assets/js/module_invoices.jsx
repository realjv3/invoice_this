/**
 * Created by John on 11/29/2016.
 * React components for invoice tracking module
 */
import React from 'react';

import 'whatwg-fetch';
import ES6Promise from 'es6-promise';
ES6Promise.polyfill();

import AutoComplete from 'material-ui/AutoComplete';
import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

import CustomerEntry from 'customer_entry.jsx';
import {getSelCustTrxs, getSelectedCustomer, getBillable, getTrx, getSelCustInvoices} from 'util.jsx';
import Paging_nav from 'paging_nav.jsx';
import Invoice from 'invoice.jsx';

class InvoiceModule extends React.Component{
    constructor(props) {
        super(props);
        this.state= {
            customers: this.initCustomers(),
            trx: [],
            selectedTrx: [
                <tr key={'trx_th'}>
                    <th style={{width: '200px', textAlign: 'center', margin: '7px'}}>Trx Date</th>
                    <th>Billable</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                </tr>
            ],
            total: 0,
            invoices: []
        }
    }
    initCustomers = () => {
        var customers = [];
        for(var i = 0; i < cur_user.customer.length; i++) {
            var customer = {
                text: cur_user.customer[i].company,
                value: (
                    <MenuItem primaryText={cur_user.customer[i].company} innerDivStyle={{display: 'flex', marginBottom: '9px'}} >
                        <span className="cust_icons" >
                            <IconButton
                                className={cur_user.customer[i].id.toString()}
                                iconClassName="fa fa-pencil"
                                tooltip="Edit Customer"
                                onClick={this.editCust}
                            />
                            <IconButton
                                className={cur_user.customer[i].id.toString()}
                                iconClassName="fa fa-trash-o"
                                tooltip="Delete Customer"
                                onClick={this.showDelCustDialog}
                            />
                        </span>
                    </MenuItem>
                )
            };
            customers.push(customer);
        }
        return customers;
    }
    updateCustomers = () => {
        this.setState({customers: this.initCustomers()});
    }
    updateTrx = () => {
        getSelCustTrxs(1);
        let cust = getSelectedCustomer();
        //Assemble trx rows
        let trx = [],
            header = (
                <tr key={'trx_th'}>
                    <th>Add to Invoice</th>
                    <th>Trx Date</th>
                    <th>Status</th>
                    <th>Billable</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                </tr>
            );
        for(var j = 0; j < cust.custtrx.data.length; j++) {
            //if trx status not open, move on to next
            if(cust.custtrx.data[j].status != 'Open')
                continue;
            //get each transaction's billable's descr and qty
            let billable = getBillable(cust.custtrx.data[j].item);
            let qty = (cust.custtrx.data[j].amt / billable.price).toFixed(2) + ' x $' + billable.price +'/'+billable.unit;
            //render table row
            let style = {
                width: '10px',
                height: '10px',
                margin: '2px'
            };
            let tmp =
                <tr key={'trx_id_' + cust.custtrx.data[j].id}>
                    <td><Checkbox id={cust.custtrx.data[j].id} onCheck={this.addToInvoice} style={{marginLeft: '55px'}}  /></td>
                    <td>{cust.custtrx.data[j].trxdt}</td>
                    <td>{cust.custtrx.data[j].status}</td>
                    <td>{billable.descr}</td>
                    <td>{cust.custtrx.data[j].descr}</td>
                    <td>{qty}</td>
                    <td>$ {cust.custtrx.data[j].amt}</td>
                </tr>;
            trx.push(tmp);
        }
        if(trx.length > 0)
            trx.unshift(header);
        this.setState({
            trx: trx,
            selectedTrx: [
                <tr key={'trx_th'}>
                    <th style={{width: '200px', textAlign: 'center', margin: '7px'}}>Trx Date</th>
                    <th>Billable</th>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                </tr>
            ],
            total: 0
        });
    }
    updateInvoices = (page = 1) => {
        let cust = getSelectedCustomer(),
            sort = (cust.invoice.sort) ? cust.invoice.sort : 'invdt',
            desc = cust.invoice.desc;
        getSelCustInvoices(page, sort, desc);
        //Assemble invoice rows
        let invoices = [ <Paging_nav refresh={this.updateInvoices} page={cust.invoice} /> ],
            header = (
                <tr key={'invoices_th'}>
                    <th>Delete</th>
                    <th id="invdt" data-sort="desc" onClick={this.sort}>Invoice Date</th>
                    <th id="amt" data-sort="" onClick={this.sort}>Invoice Amount</th>
                </tr>
            );
        for(let i = 0; i < cust.invoice.data.length; i++) {
            //render table row
            let style = {
                width: '10px',
                height: '10px',
                margin: '2px'
            };
            let tmp =
                <tr key={'inv_id_' + cust.invoice.data[i].id}>
                    <td>
                        <span className="cust_icons" >
                            <IconButton
                                className={cust.invoice.data[i].id.toString()}
                                iconClassName="fa fa-trash-o"
                                tooltip="Delete Invoice"
                                onClick={this.deleteInvoice}
                            />
                        </span>
                    </td>
                    <td>{cust.invoice.data[i].invdt}</td>
                    <td>{cust.invoice.data[i].amt}</td>
                </tr>;
            invoices.push(tmp);
        }
        if(invoices.length > 0)
            invoices.unshift(header);
        this.setState({invoices: invoices});
    }
    addToInvoice = (event, isInputChecked) => {
        if(isInputChecked) {
            let trx = getTrx(event.currentTarget.id),
                total = (parseFloat(this.state.total) + parseFloat(trx.amt)).toFixed(2),
                trxs = this.state.selectedTrx,
                billable = getBillable(trx.item),
                qty = (trx.amt / billable.price).toFixed(2) + ' x $' + billable.price +'/'+billable.unit,
                tmp =
                <tr key={'trx_id_' + event.currentTarget.id}>
                    <td>{trx.trxdt}</td>
                    <td>{billable.descr}</td>
                    <td>{trx.descr}</td>
                    <td>{qty}</td>
                    <td>$ {trx.amt}</td>
                </tr>;
            trxs.push(tmp);
            this.setState({selectedTrx: trxs, total: total});
        } else {
            let trx = getTrx(event.currentTarget.id),
                trxs = this.state.selectedTrx,
                total = parseFloat(this.state.total).toFixed(2);
            if(total > 0)
                total = total - parseFloat(trx.amt).toFixed(2);
            for(let i = 0; i < trxs.length; i++)
                if(trxs[i].key == 'trx_id_'+ event.currentTarget.id)
                    trxs.splice(i, 1);
            this.setState({selectedTrx: trxs, total: total});
        }
    }
    deleteInvoice = () => {
        console.log('hi');
    }
    /**
     * Auto-complete selection/onBlur calls this function with cust object when selecting from drop-down
     * @param object/string chosen - can be a FocusEvent or MenuItem object, or a string, on blur or select
     * @return boolean true if customer exists
     * @return boolean false if customer doesn't exist & opens CustomerEntry dialog
     */
    doesCustExist = (chosen) => {
        let exists = false;
        let input = '';

        // Get input customer
        if (typeof chosen == 'string') { // pressing enter in customer
            if (chosen == '') return false;
            input = chosen;
        } else if(chosen.value) //selecting from customer drop-down - onNewRequest makes 2nd call
            input = chosen.text;
        else if (chosen instanceof FocusEvent) { // onBlur of customer/billables field (during select & tab or click out)
            if (chosen.target.value.length == 0 || !chosen.relatedTarget) return false;
            if (chosen.relatedTarget.nodeName == 'SPAN') //selecting from customer drop-down - onBLur makes 1st call
                return true;
            input = chosen.target.value;
        }

        // check if customer exists and get their billables for drop-down store, else open CustomerEntry dialog
        for (var i = 0; i < cur_user.customer.length; i++) {
            cur_user.customer[i].selected = false;
            if (cur_user.customer[i].company.toLowerCase().trim() == input.toLowerCase().trim()) {
                cur_user.customer[i].selected = true;
                exists = true;
            }
        }
        if (exists) {
            this.updateTrx();
            this.updateInvoices();
            return true;
        } else {
            this.refs.cust_entry.handleOpen(input);
            return false;
        }
    }
    /**
     * will set sort and dir in cur_user global
     * @param event onClick of trx table header
     */
    sort = (event) => {
        let field = event.currentTarget.id,
            dir = event.currentTarget.getAttribute('data-sort');
        //if asc, set to desc
        if(dir == 'asc') {
            event.currentTarget.setAttribute('data-sort', 'desc');
            dir = 'desc';
        }
        else if(dir == '' || dir == 'desc') {
            event.currentTarget.setAttribute('data-sort', 'asc');
            dir = 'asc';
        }
        //update transactions
        if(dir == 'asc')
            dir = false;
        else if(dir == 'desc')
            dir = true;
        let cust = getSelectedCustomer();
        cust.invoice.sort = field;
        cust.invoice.desc = dir;
        for(let i = 0; i < cur_user.customer.length; i++)
            if(cur_user.customer[i].id == cust.id) {
                cur_user.customer[i] = cust;
                break;
            }
        this.updateInvoices(1);
    }
    componentDidMount = () => {
        document.getElementById('trx_entry_customer').addEventListener('blur', this.doesCustExist);
    }
    render() {
        return (
            <div>
                <CustomerEntry ref="cust_entry" updateCustomersDropDown={this.updateCustomers} />
                <AutoComplete
                    dataSource={this.state.customers}
                    openOnFocus={true}
                    floatingLabelText="Customer"
                    id="trx_entry_customer"
                    ref="trx_entry_customer"
                    style={{marginRight: '25px'}}
                    filter={(searchText, key) => { return (key.toLowerCase().indexOf(searchText.toLowerCase()) >= 0); }}
                    listStyle={{width: 'auto', minWidth: '400px'}}
                    onNewRequest={this.doesCustExist}
                />
                <table>
                    <tbody>
                        {this.state.invoices}
                    </tbody>
                </table>
                <Divider />
                <table>
                    <tbody>
                        {this.state.trx}
                    </tbody>
                </table>
                <Invoice trx={this.state.selectedTrx} total={this.state.total} updateTrx={this.updateTrx} />
            </div>
        );
    }
}

export {InvoiceModule as default};
