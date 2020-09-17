'use strict';

// require the AWS SDK
import { RDSDataService } from 'aws-sdk';
const rdsDataService = new RDSDataService()


// aws api-client
const data = require('data-api-client')({
  secretArn: process.env.SECRETS_ARN,
  resourceArn: process.env.DB_ARN,
  database: process.env.DB_NAME // default database
})

// axios
import axios from 'axios';

//promise
var Promise = require('promise');


module.exports.getattendance = (event, context, callback) => {
  const config = {
    method: 'get',
    url: process.env.URL, //Need the actual endpoint. use https://jsonplaceholder.typicode.com/todos/ for now.
    params: {
      id: JSON.parse(event.body).id  //Are we sending id as query variable? path variable? or no params?
    },
    responseType: 'json',
    headers: { 'Authorization': 'AUTH_TOKEN' }, //we need a token?
    auth: {           //We need some kind of auth?
      username: '',
      password: ''
    }

  }

  getBooking = async (config) => {
    try {
      const resp = await axios.get(config)
      processBooking(resp.data);
    }
    catch (error) {
      console.error(error);
    }
  }

  processBooking = async (booking) => {
    try {
      const mem = await attendance(booking);
    }
    catch (error) {
      console.error(error);
    }
  }

  //Process booking in db
  attendance = async (booking) => {

    let dest_id = await data.query(
      'select destination_id from source_map where source_id = :booking_id',
      { booking_id: booking.booking_id }
    )

    //check if booking exists, if not create new
    if (dest_id == 0) {
      let child_res = await data.transaction().query('insert into booking (activity_type, member_id) VALUES(:activity_type, :member_id)', { activity_type: 'booking', member_id: booking.member_id })
        .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id :source_name, :destination_id :destination_name)'],
          [
            [{ source_id: booking.booking_id, source_name: "ievents", destination_id: r.insertId, destination_name: "activity" }]
          ])
        .rollback((e, status) => {
          console.log(e)
          return;
        })
        .commit()

      let res = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: booking.booking_id }
      )
      const book_id = res.forEach((col) => {
        const x = col.destination_id
        return x;
      })


      child_res = await data.query(`INSERT INTO booking_meta (booking_id,booking_key,booking_value) VALUES(:booking_id,:booking_key,:booking_value)`,
        [
          [{ booking_id: book_id, booking_key: 'reference_code', booking_value: booking.reference_code }],
          [{ booking_id: book_id, booking_key: 'create_date', booking_value: booking.create_date }],
          [{ booking_id: book_id, booking_key: 'booking_timeslot', booking_value: booking.booking_timeslot }],
          [{ booking_id: book_id, booking_key: 'bookingdate_and_timeslot', booking_value: booking.bookingdate_and_timeslot }],
          [{ booking_id: book_id, booking_key: 'status', booking_value: booking.status }],
          [{ booking_id: book_id, booking_key: 'member_id', booking_value: booking.member_id }],
          [{ booking_id: book_id, booking_key: 'member_username', booking_value: booking.member_username }],
          [{ booking_id: book_id, booking_key: 'Attended', booking_value: booking.Attended }],
          [{ booking_id: book_id, booking_key: 'checkin_headcount_children', booking_value: booking.checkin_headcount_children }],
          [{ booking_id: book_id, booking_key: 'checkin_headcount_adults', booking_value: booking.heckin_headcount_adults }],
          [{ booking_id: book_id, booking_key: 'checkin_headcount_all', booking_value: booking.checkin_headcount_all }],
          [{ booking_id: book_id, booking_key: 'checkin_time', booking_value: booking.checkin_time }],
          [{ booking_id: book_id, booking_key: 'checkout_time', booking_value: booking.checkout_time }],
          [{ booking_id: book_id, booking_key: 'checkin_time_parent', booking_value: booking.checkin_time_parent }],
          [{ booking_id: book_id, booking_key: 'checkout_time_parent', booking_value: booking.checkout_time_parent }],
          [{ booking_id: book_id, booking_key: 'Remark', booking_value: booking.Remark }]
        ]
      )

      return { group_id, child_id };

    }

    //update meta_data with child
    else {
      child_res = await data.query(`UPDATE booking_meta set booking_value = :booking_value WHERE booking_id = :booking_id AND booking_key = :booking_key`,
        [
          [{ booking_id: book_id, booking_key: 'reference_code', booking_value: booking.reference_code }],
          [{ booking_id: book_id, booking_key: 'create_date', booking_value: booking.create_date }],
          [{ booking_id: book_id, booking_key: 'booking_timeslot', booking_value: booking.booking_timeslot }],
          [{ booking_id: book_id, booking_key: 'bookingdate_and_timeslot', booking_value: booking.bookingdate_and_timeslot }],
          [{ booking_id: book_id, booking_key: 'status', booking_value: booking.status }],
          [{ booking_id: book_id, booking_key: 'member_id', booking_value: booking.member_id }],
          [{ booking_id: book_id, booking_key: 'member_username', booking_value: booking.member_username }],
          [{ booking_id: book_id, booking_key: 'Attended', booking_value: booking.Attended }],
          [{ booking_id: book_id, booking_key: 'checkin_headcount_children', booking_value: booking.checkin_headcount_children }],
          [{ booking_id: book_id, booking_key: 'checkin_headcount_adults', booking_value: booking.heckin_headcount_adults }],
          [{ booking_id: book_id, booking_key: 'checkin_headcount_all', booking_value: booking.checkin_headcount_all }],
          [{ booking_id: book_id, booking_key: 'checkin_time', booking_value: booking.checkin_time }],
          [{ booking_id: book_id, booking_key: 'checkout_time', booking_value: booking.checkout_time }],
          [{ booking_id: book_id, booking_key: 'checkin_time_parent', booking_value: booking.checkin_time_parent }],
          [{ booking_id: book_id, booking_key: 'checkout_time_parent', booking_value: booking.checkout_time_parent }],
          [{ booking_id: book_id, booking_key: 'Remark', booking_value: booking.Remark }]
        ]
      )

    }
  }

  getBooking(config);

}

