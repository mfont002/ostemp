//api client
const data = require('data-api-client')({
  secretArn: process.env.SECRETS_ARN,
  resourceArn: process.env.DB_ARN,
  database: process.env.DB_NAME
})

// axios
const axios = require('axios');

module.exports.getattendance = (event, context, callback) => {

  const config = {
    method: 'get',
    withCredentials: false,
    params: {
      id: event.pathParameters.id  //Are we sending id as query variable? path variable? or no params?
      //id: JSON.parse(event.pathParameters).id 
    },
    responseType: 'json',
    /* headers: { 'Authorization': 'AUTH_TOKEN' }, //we need a token?
    auth: {           //We need some kind of auth?
      username: '',
      password: ''
    } */

  }

  let getBooking = async (config) => {
    //const url = 'http://my-json-server.typicode.com/OneGlobe/ostemp/bookings'
    const url = process.env.URL
    try {
      const resp = await axios.get(url, config)
      const booking = resp.data[0]
      processBooking(booking);
    }
    catch (error) {
      console.error(error);
    }
  }

  let processBooking = async (booking) => {
    try {
      const mem = await attendance(booking);
    }
    catch (error) {
      console.error(error);
    }
  }

  //Process booking in db
  let attendance = async (booking) => {
    try {
      let dest_id = await data.query(
        'select source_id from source_map where source_id = :booking_id',
        { booking_id: booking.booking_id }
      )

      //check if booking exists, if not create new
      if (dest_id.records == 0) {

        let child_res = await data.transaction().query('insert into booking (activity_type, member_id) VALUES(:activity_type, :member_id)', { activity_type: 'booking', member_id: booking.member_id })
          .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id, :source_name, :destination_id, :destination_name)',
            { source_id: booking.booking_id, source_name: "ievents", destination_id: r.insertId, destination_name: "activity" }
          ])
          .rollback((e, status) => {
            console.log(status)
            console.log(e.error)
            return;
          })
          .commit()

        let res = await data.query(
          'select destination_id from source_map where source_id = :id',
          { id: booking.booking_id }
        )
        const book_id = res.records[0].destination_id

        await data.query(`INSERT INTO booking_meta (booking_id,booking_key,booking_value) VALUES(:booking_id,:booking_key,:booking_value)`,
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
            [{ booking_id: book_id, booking_key: 'checkin_headcount_adults', booking_value: booking.checkin_headcount_adults }],
            [{ booking_id: book_id, booking_key: 'checkin_headcount_all', booking_value: booking.checkin_headcount_all }],
            [{ booking_id: book_id, booking_key: 'checkin_time', booking_value: booking.checkin_time }],
            [{ booking_id: book_id, booking_key: 'checkout_time', booking_value: booking.checkout_time }],
            [{ booking_id: book_id, booking_key: 'checkin_time_parent', booking_value: booking.checkin_time_parent }],
            [{ booking_id: book_id, booking_key: 'checkout_time_parent', booking_value: booking.checkout_time_parent }],
            [{ booking_id: book_id, booking_key: 'Remark', booking_value: booking.Remark }]
          ]
        )
      }

      //booking doesn't exist update meta_data with child
      else {
        let res = await data.query(
          'select destination_id from source_map where source_id = :id',
          { id: booking.booking_id }
        )
        const book_id = res.records[0].destination_id

        await data.query(`UPDATE booking_meta set booking_value = :booking_value WHERE booking_id = :booking_id AND booking_key = :booking_key`,
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
            [{ booking_id: book_id, booking_key: 'checkin_headcount_adults', booking_value: booking.checkin_headcount_adults }],
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
    catch (error) {
      console.error(error);
    }
  }

  getBooking(config);

}