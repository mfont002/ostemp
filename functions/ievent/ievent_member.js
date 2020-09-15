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
      processDbUser(resp.data);
    }
    catch (error) {
      console.error(error);
    }
  }

  processDbUser = async (user) => {
    try {
      let dest_id = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: user.id }
      )

      if (dest_id == 0) {
        let result = await data.transaction().query('insert into member' +
          '(username,' +
          'status,' +
          'creation_date,' +
          'activated,' +
          'first_name,' +
          'last_name,' +
          'email,' +
          'phone,' +
          'hkid,' +
          'chinese_name,' +
          'gender,' +
          'birthday,' +
          'child_ethnicity,' +
          'born_in_hk,' +
          'date_of_arrival,' +
          'child_dev,' +
          'child_diag,' +
          'child_birth_place,' +
          'parent_lastname,' +
          'parent_firstname,' +
          'parent_chinese_name,' +
          'parent_dob,' +
          'parent_gender,' +
          'parent_marital_status,' +
          'parent_ethnicity,' +
          'parent_born_in_hk,' +
          'parent_date_of_arrival,' +
          'parent_birth_place,' +
          'relationship,' +
          'parent_hkid,' +
          'parent_contact_no,' +
          'address,' +
          'parent_cssa_iss,' +
          'parent_monthly_income_household,' +
          'parent_hear_about_us,' +
          'cgg_1_caregiver_surname,' +
          'cgg_1_caregiver_firstname,' +
          'cgg_1_caregiver_chinese_name,' +
          'cgg_1_caregiver_gender,' +
          'cgg_1_caregiver_dob,' +
          'cgg_1_caregiver_ethnicity,' +
          'cgg_1_caregiver_hkid,' +
          'cgg_1_caregiver_relationship,' +
          'cgg_1_caregiver_contact_no,' +
          'cgg_2_caregiver_surname,' +
          'cgg_2_caregiver_firstname,' +
          'cgg_2_caregiver_chinese_name,' +
          'cgg_2_caregiver_gender,' +
          'cgg_2_caregiver_dob,' +
          'cgg_2_caregiver_ethnicity,' +
          'cgg_2_caregiver_hkid,' +
          'cgg_2_caregiver_relationship,' +
          'cgg_2_caregiver_contact_no,' +
          'energency_name,' +
          'emergency_contact_no,' +
          'emergency_relationship,' +
          'companion,' +
          'FIELD67,' +
          'expiration_date,' +
          'member_legal_guardian,' +
          'disclaimer_and_pics)' +
          ' VALUES(:member_type,:username,:status,:creation_date,:activated,:first_name,:last_name,:email,:phone,:hkid,:chinese_name,:gender,:birthday,:child_ethnicity,:born_in_hk,:date_of_arrival,:child_dev,:child_diag,' +
          ':child_birth_place,:parent_lastname,:parent_firstname,:parent_chinese_name,:parent_dob,:parent_gender,:parent_marital_status,:parent_ethnicity,:parent_born_in_hk,' +
          ':parent_date_of_arrival,:parent_birth_place,:relationship,:parent_hkid,:parent_contact_no,:address,:parent_cssa_iss,:parent_monthly_income_household,:parent_hear_about_us,' +
          ':cgg_1_caregiver_surname,:cgg_1_caregiver_firstname,:cgg_1_caregiver_chinese_name,:cgg_1_caregiver_gender,:cgg_1_caregiver_dob,:cgg_1_caregiver_ethnicity,:cgg_1_caregiver_hkid,' +
          ':cgg_1_caregiver_relationship,' +
          ':cgg_1_caregiver_contact_no,' +
          ':cgg_2_caregiver_surname,' +
          ':cgg_2_caregiver_firstname,' +
          ':cgg_2_caregiver_chinese_name,' +
          ':cgg_2_caregiver_gender,' +
          ':cgg_2_caregiver_dob,' +
          ':cgg_2_caregiver_ethnicity,' +
          ':cgg_2_caregiver_hkid,' +
          ':cgg_2_caregiver_relationship,' +
          ':cgg_2_caregiver_contact_no,' +
          ':energency_name,' +
          ':emergency_contact_no,' +
          ':emergency_relationship,' +
          ':companion,' +
          ':FIELD67,' +
          ':expiration_date,' +
          ':member_legal_guardian,' +
          ':disclaimer_and_pics),' +
          ' {member_type: "child",username: user.username,status: user.status,creation_date: user.creation_date,activated: user.activated, first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone, hkid: user.hkid, chinese_name: user.chinese_name, gender: user.gender, birthday: user.birthday, child_ethnicity: user.child_ethnicity, born_in_hk: user.born_in_hk, date_of_arrival: user.date_of_arrival,' +
          'child_dev: user.child_dev, child_diag: user.child_diag,' +
          'child_birth_place: user.child_birth_place, parent_lastname: user.parent_lastname,parent_firstname: user.parent_firstname, parent_chinese_name: user.parent_chinese_name,' +
          'parent_dob: user.parent_dob,parent_gender: user.parent_gender,parent_marital_status: user.parent_marital_status,parent_ethnicity: user.parent_ethnicity,parent_born_in_hk: user.parent_born_in_hk,' +
          'parent_date_of_arrival: user.parent_date_of_arrival,parent_birth_place: user.parent_birth_place,relationship: user.parent_relationship,parent_hkid: user.parent_hkid,' +
          'parent_contact_no: user.parent_contact_no,address: user.address,parent_cssa_iss: user.parent_cssa_iss,parent_monthly_income_household: user.parent_monthly_income_household,' +
          'parent_hear_about_us: user.parent_hear_about_us,' +
          'cgg_1_caregiver_surname: user.cgg_1_caregiver_surname,' +
          'cgg_1_caregiver_firstname: user.cgg_1_caregiver_firstname,' +
          'cgg_1_caregiver_chinese_name: user.cgg_1_caregiver_chinese_name,' +
          'cgg_1_caregiver_gender: user.cgg_1_caregiver_gender,' +
          'cgg_1_caregiver_dob: cgg_1_caregiver_dob,' +
          'cgg_1_caregiver_ethnicity: cgg_1_caregiver_ethnicity,' +
          'cgg_1_caregiver_hkid: user.cgg_1_caregiver_hkid,' +
          'cgg_1_caregiver_relationship: user.cgg_1_caregiver_relationship,' +
          'cgg_1_caregiver_contact_no: user.cgg_1_caregiver_contact_no,' +
          'cgg_2_caregiver_surname: user.cgg_1_caregiver_surname,' +
          'cgg_2_caregiver_firstname: user.cgg_1_caregiver_firstname,' +
          'cgg_2_caregiver_chinese_name: user.cgg_1_caregiver_chinese_name,' +
          'cgg_2_caregiver_gender: user.cgg_1_caregiver_gender,' +
          'cgg_2_caregiver_dob: cgg_1_caregiver_dob,' +
          'cgg_2_caregiver_ethnicity: cgg_1_caregiver_ethnicity,' +
          'cgg_2_caregiver_hkid:, user.cgg_1_caregiver_hkid,' +
          'cgg_2_caregiver_relationship: user.cgg_1_caregiver_relationship,' +
          'cgg_2_caregiver_contact_no: user.cgg_1_caregiver_contact_no,' +
          'energency_name: user.energency_name,' +
          'emergency_contact_no:, user.emergency_contact_no,' +
          'emergency_relationship: user.emergency_relationship,' +
          'companion: user.companion,' +
          'FIELD67: user.FIELD67,' +
          'expiration_date: user.expiration_date,' +
          'member_legal_guardian: user.member_legal_guardian,' +
          'disclaimer_and_pics: user.disclaimer_and_pics}')
          .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name)' +
            'values(:source_id :source_name, :destination_id :destination_name),' +
            '{source_id: user.id, source_name: "ievents", destination_id: r.insertId, destination_name: "member" }'])
          .query('insert into member_group (type) values(:type)', { type: "Household" })
          .query((x) => ['insert into member_group_meta (member_group_id, meta_key, meta_value) values(:member_group_id, :meta_key, :meta_value)' +
            ',{ member_group_id: x.insertId, meta_key: "name", meta_value: user.last_name+"Household" }'])
          .query((r, x) => ['insert into member_group_map (member_id, group_id) values(:member_id, :group_id)', { member_id: r.insertId, group_id: r.insertId }])
          .rollback((e, status) => { console.log(e) }) // optional
          .commit()
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
  }

  getMember(config);


}


