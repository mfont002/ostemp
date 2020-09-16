//'use strict';



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


export function getmember(event, context, callback) {

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

  getMember = async (config) => {
    try {
      const resp = await axios.get(config)
      processUser(resp.data);
    }
    catch (error) {
      console.error(error);
    }
  }

  processUser = async (user) => {
    try {
      let dest_id = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: user.id }
      )

      if (dest_id == 0) {


        let child_res = await data.transaction().query('insert into member (member_type) VALUES(:member_type)',{member_type: 'child'})
          .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id :source_name, :destination_id :destination_name)'],
          [
            [{ source_id: user.id, source_name: "ievents", destination_id: r.insertId, destination_name: "member" }]
          ])



        let res = await data.query(
          'select destination_id from source_map where source_id = :id',
          { id: user.id }
        )
          const dest_id = res.forEach((col) => {
          const x = col.destination_id
          return x
          })

        child_res = await data.transaction().query('insert into member_group (type) values(:type)', { type: "household" })
        .query((r) => ['insert into member_group_map (member_id, group_id) values(:member_id, :group_id)', 
          { member_id: dest_id, group_id: r.insertId }])
         


        res = await data.query(
          'select group_id from member_group_map where member_id = :dest_id',
          { dest_id: dest_id }
        )
        const group_id = res.forEach((col) => {
          const x = col.destination_id
          return x
        })

        child_res = await data.transaction().query((r) => ['insert into member_group_meta (member_group_id, meta_key, meta_value) values(:member_group_id, :meta_key, :meta_value)',
          { member_group_id: group_id, meta_key: "name", meta_value: user.last_name + "Household"}])


          child_res = await data.transaction().query(`INSERT INTO member_meta (member_id,member_key,member_value) VALUES(:member_id,:member_key,:member_value)`,
            [
              [{ member_id: r.insertId, member_key: 'user_name', member_value: user.username }],
              [{ member_id: r.insertId, member_key: 'email', member_value: user.email }],
              [{ member_id: r.insertId, member_key: 'status', member_value: user.status }],
              [{ member_id: r.insertId, member_key: 'creation_date', member_value: user.creation_date }],
              [{ member_id: r.insertId, member_key: 'activated', member_value: user.activated }],
              [{ member_id: r.insertId, member_key: 'last_name', member_value: user.last_name }],
              [{ member_id: r.insertId, member_key: 'first_name', member_value: user.first_name }],
              [{ member_id: r.insertId, member_key: 'chinese_name', member_value: user.chinese_name }],
              [{ member_id: r.insertId, member_key: 'gender', member_value: user.gender }],
              [{ member_id: r.insertId, member_key: 'birthdate', member_value: user.birthday }],
              [{ member_id: r.insertId, member_key: 'ethnicity', member_value: user.child_ethnicity }],
              [{ member_id: r.insertId, member_key: 'born_in_hk', member_value: user.born_in_hk }],
              [{ member_id: r.insertId, member_key: 'date_of_arrival', member_value: user.date_of_arrival }],
              [{ member_id: r.insertId, member_key: 'child_dev', member_value: user.child_dev }],
              [{ member_id: r.insertId, member_key: 'child_diag', member_value: user.child_diag }],
              [{ member_id: r.insertId, member_key: 'birth_place', member_value: user.child_birth_place }],
              [{ member_id: r.insertId, member_key: 'address', member_value: user.address }]
            ]
          )






      }
      else {
        let result = await data.transaction()
          .query('UPDATE member_meta SET member_value = :username WHERE member_id = :dest_id' +
            'AND member_key = :key', { key: 'user_name', username: user.username, dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :email WHERE member_id = :dest_id' +
            'AND member_key = :key', { email: user.email, key: 'email', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :status WHERE member_id = :dest_id' +
            'AND member_key = :key', { status: user.status, key: 'status', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :creation_date WHERE member_id = :dest_id' +
            'AND member_key = :key', { creation_date: user.creation_date, key: 'creation_date', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :activated WHERE member_id = :dest_id' +
            'AND member_key = :key', { activated: user.activated, key: 'activated', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :last_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { last_name: user.last_name, key: 'last_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :first_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { first_name: user.first_name, key: 'first_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :chinese_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { chinese_name: user.chinese_name, key: 'chinese_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :gender WHERE member_id = :dest_id' +
            'AND member_key = :key', { gender: user.gender, key: 'gender', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :birthday WHERE member_id = :dest_id' +
            'AND member_key = :key', { birthday: user.birthday, key: 'birthday', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :child_ethnicity WHERE member_id = :dest_id' +
            'AND member_key = :key', { child_ethnicity: user.child_ethnicity, key: 'child_ethnicity', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :born_in_hk WHERE member_id = :dest_id' +
            'AND member_key = :key', { born_in_hk: user.born_in_hk, key: 'born_in_hk', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :date_of_arrival WHERE member_id = :dest_id' +
            'AND member_key = :key', { date_of_arrival: user.date_of_arrival, key: 'date_of_arrival', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :child_dev WHERE member_id = :dest_id' +
            'AND member_key = :key', { child_dev: user.child_dev, key: 'child_dev', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :child_diag WHERE member_id = :dest_id' +
            'AND member_key = :key', { child_diag: user.child_diag, key: 'child_diag', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :child_birth_place WHERE member_id = :dest_id' +
            'AND member_key = :key', { child_birth_place: user.child_birth_place, key: 'child_birth_place', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_last_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_last_name: user.parent_last_name, key: 'parent_last_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_first_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_first_name: user.parent_first_name, key: 'parent_first_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_chinese_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_chinese_name: user.parent_chinese_name, key: 'parent_chinese_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_dob WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_dob: user.parent_dob, key: 'parent_dob', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_gender WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_gender: user.parent_gender, key: 'parent_gender', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_marital_status WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_marital_status: user.parent_marital_status, key: 'parent_marital_status', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_ethnicity WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_ethnicity: user.parent_ethnicity, key: 'parent_ethnicity', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_born_in_hk WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_born_in_hk: user.parent_born_in_hk, key: 'parent_born_in_hk', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_date_of_arrival WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_date_of_arrival: user.parent_date_of_arrival, key: 'parent_date_of_arrival', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_birth_place WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_birth_place: user.parent_birth_place, key: 'parent_birth_place', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :relationship WHERE member_id = :dest_id' +
            'AND member_key = :key', { relationship: user.relationship, key: 'relationship', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_hkid WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_hkid: user.parent_hkid, key: 'parent_hkid', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_contact_no WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_contact_no: user.parent_contact_no, key: 'parent_contact_no', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :address WHERE member_id = :dest_id' +
            'AND member_key = :key', { address: user.address, key: 'address', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_cssa_iss WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_cssa_iss: user.parent_cssa_iss, key: 'parent_cssa_iss', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_monthly_income_household WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_monthly_income_household: user.parent_monthly_income_household, key: 'parent_monthly_income_household', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :parent_hear_about_us WHERE member_id = :dest_id' +
            'AND member_key = :key', { parent_hear_about_us: user.parent_hear_about_us, key: 'parent_hear_about_us', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_surname WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_surname: user.cgg_1_caregiver_surname, key: 'cgg_1_caregiver_surname', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_firstname WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_firstname: user.cgg_1_caregiver_firstname, key: 'cgg_1_caregiver_firstname', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_chinese_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_chinese_name: user.cgg_1_caregiver_chinese_name, key: 'cgg_1_caregiver_chinese_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_gender WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_gender: user.cgg_1_caregiver_gender, key: 'cgg_1_caregiver_gender', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_dob WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_dob: user.cgg_1_caregiver_dob, key: 'cgg_1_caregiver_dob', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_ethnicity WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_ethnicity: user.cgg_1_caregiver_ethnicity, key: 'cgg_1_caregiver_ethnicity', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_hkid WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_hkid: user.cgg_1_caregiver_hkid, key: 'cgg_1_caregiver_hkid', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_relationship WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_relationship: user.cgg_1_caregiver_relationship, key: 'cgg_1_caregiver_relationship', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_1_caregiver_contact_no WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_1_caregiver_contact_no: user.cgg_1_caregiver_contact_no, key: 'cgg_1_caregiver_contact_no', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_surname WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_surname: user.cgg_2_caregiver_surname, key: 'cgg_2_caregiver_surname', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_firstname WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_firstname: user.cgg_2_caregiver_firstname, key: 'cgg_2_caregiver_firstname', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_chinese_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_chinese_name: user.cgg_2_caregiver_chinese_name, key: 'cgg_2_caregiver_chinese_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_gender WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_gender: user.cgg_2_caregiver_gender, key: 'cgg_2_caregiver_gender', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_dob WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_dob: user.cgg_2_caregiver_dob, key: 'cgg_2_caregiver_dob', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_ethnicity WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_ethnicity: user.cgg_2_caregiver_ethnicity, key: 'cgg_2_caregiver_ethnicity', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_hkid WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_hkid: user.cgg_2_caregiver_hkid, key: 'cgg_2_caregiver_hkid', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_relationship WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_relationship: user.cgg_2_caregiver_relationship, key: 'cgg_2_caregiver_relationship', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :cgg_2_caregiver_contact_no WHERE member_id = :dest_id' +
            'AND member_key = :key', { cgg_2_caregiver_contact_no: user.cgg_2_caregiver_contact_no, key: 'cgg_2_caregiver_contact_no', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :energency_name WHERE member_id = :dest_id' +
            'AND member_key = :key', { energency_name: user.energency_name, key: 'energency_name', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :emergency_contact_no WHERE member_id = :dest_id' +
            'AND member_key = :key', { emergency_contact_no: user.emergency_contact_no, key: 'emergency_contact_no', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :emergency_relationship WHERE member_id = :dest_id' +
            'AND member_key = :key', { emergency_relationship: user.emergency_relationship, key: 'emergency_relationship', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :companion WHERE member_id = :dest_id' +
            'AND member_key = :key', { companion: user.companion, key: 'companion', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :companion WHERE member_id = :dest_id' +
            'AND member_key = :key', { companion: user.companion, key: 'companion', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :FIELD67 WHERE member_id = :dest_id' +
            'AND member_key = :key', { FIELD67: user.FIELD67, key: 'FIELD67', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :expiration_date WHERE member_id = :dest_id' +
            'AND member_key = :key', { expiration_date: user.expiration_date, key: 'expiration_date', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :member_legal_guardian WHERE member_id = :dest_id' +
            'AND member_key = :key', { member_legal_guardian: user.member_legal_guardian, key: 'member_legal_guardian', dest_id: dest_id })
          .query('UPDATE member_meta SET member_value = :disclaimer_and_pics WHERE member_id = :dest_id' +
            'AND member_key = :key', { disclaimer_and_pics: user.disclaimer_and_pics, key: 'disclaimer_and_pics', dest_id: dest_id })
          .rollback((e, status) => { console.log(e) }) // optional
          .commit()
      }
    }
    catch (error) {
      console.error(error);
    }

try{
  let dest_id = await data.query(
    'select destination_id from source_map where source_id = :id',
    { id: user.AdultID_Parent }
  )

  if (dest_id == 0) {
    let child_res = await data.transaction().query('insert into member (member_type) VALUES(:member_type)',
      { member_type: 'child' })
      .query((r) => [`INSERT INTO member_meta (member_id,member_key,member_value) VALUES(:member_id,:member_key,:member_value)`],
        [
          [{ member_id: r.insertId, member_key: 'last_name', member_value: user.parent_last_name }],
          [{ member_id: r.insertId, member_key: 'first_name', member_value: user.parent_first_name }],
          [{ member_id: r.insertId, member_key: 'chinese_name', member_value: user.chinese_name }],
          [{ member_id: r.insertId, member_key: 'gender', member_value: user.parent_gender }],
          [{ member_id: r.insertId, member_key: 'birthdate', member_value: user.parent_dob }],
          [{ member_id: r.insertId, member_key: 'ethnicity', member_value: user.parent_ethnicity }],
          [{ member_id: r.insertId, member_key: 'born_in_hk', member_value: user.parent_born_in_hk }],
          [{ member_id: r.insertId, member_key: 'date_of_arrival', member_value: user.parent_date_of_arrival }],
          [{ member_id: r.insertId, member_key: 'child_dev', member_value: user.child_dev }],
          [{ member_id: r.insertId, member_key: 'child_diag', member_value: user.child_diag }],
          [{ member_id: r.insertId, member_key: 'birth_place', member_value: user.parent_birth_place }]
          [{ member_id: r.insertId, member_key: 'hkid', member_value: user.parent_hkid }],
          [{ member_id: r.insertId, member_key: 'contact_number', member_value: user.parent_contact_no }]
          [{ member_id: r.insertId, member_key: 'cssa_iss', member_value: user.parent_cssa_iss }]
          [{ member_id: r.insertId, member_key: 'monthly_income_household', member_value: user.parent_monthly_income_household }],
          [{ member_id: r.insertId, member_key: 'hear_about_us', member_value: user.parent_hear_about_us }]
        ]
      )

  }
  else {

  }

}
catch(error){
  console.error(error);
}



  }

processChild(){
  
}

processParent(){

}

processCC1(){

}

processCC2(){

}


  getMember(config);


}


