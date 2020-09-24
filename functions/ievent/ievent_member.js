//'use strict';



// require the AWS SDK
import { RDSDataService } from 'aws-sdk';
const rdsDataService = new RDSDataService()


// aws api-client
const data = require('data-api-client')({
  secretArn: process.env.SECRETS_ARN,
  resourceArn: process.env.DB_ARN,
  database: process.env.DB_NAME 
});

// axios
const axios = require('axios');

//promise
var Promise = require('promise');


module.exports.getmember = (event, context, callback) => {

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
      const mem = await processChild(user);
      processParent(user, mem);
      processCC1(user, mem);
      processCC2(user, mem);
    }
    catch (error) {
      console.error(error);
    }
  }

  //Process child in db
  processChild = async (user) => {

    let dest_id = await data.query(
      'select source_id from source_map where source_id = :id',
      { id: user.id }
    )

    //check if member exists, if not create new
    if (dest_id == 0) {
      let child_res = await data.transaction().query('insert into member (member_type) VALUES(:member_type)', { member_type: 'child' })
        .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id, :source_name, :destination_id, :destination_name)'],
          [
            [{ source_id: user.id, source_name: "ievents", destination_id: r.insertId, destination_name: "member" }]
          ])
        .rollback((e, status) => {
          console.log(e)
          return;
        })
        .commit()

      let res = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: user.id }
      )
      const child_id = res.forEach((col) => {
        const x = col.destination_id
        return x;
      })

      child_res = await data.transaction().query('insert into member_group (type) values(:type)', { type: "household" })
        .query((r) => ['insert into member_group_map (member_id, group_id) values(:member_id, :group_id)',
          { member_id: child_id, group_id: r.insertId }])
        .rollback((e, status) => {
          console.log(e)
          return;
        })
        .commit()


      res = await data.query(
        'select group_id from member_group_map where member_id = :dest_id',
        { dest_id: child_id }
      )
      const group_id = res.forEach((col) => {
        const x = col.destination_id
        return x;
      })

      child_res = await data.query('insert into member_group_meta (member_group_id, meta_key, meta_value) values(:member_group_id, :meta_key, :meta_value)',
        { member_group_id: group_id, meta_key: "name", meta_value: user.last_name + "Household" })


      //check for relation
      if (user.is_sibling) {
        let sib_id = await data.query(
          'select destination_id from source_map where source_id = :id',
          { id: user.primary_member_id }
        )
        if (sib_id) {
          parent_res = await data.query('insert into member_relationship (member_id1, member_id2, relationship) values(:id1, :id2, :rel)',
            { id1: child_id, id2: sib_id, rel: 'sibling' })
        }
      }

      child_res = await data.query(`INSERT INTO member_meta (member_id,member_key,member_value) VALUES(:member_id,:member_key,:member_value)`,
        [
          [{ member_id: child_id, member_key: 'user_name', member_value: user.username }],
          [{ member_id: child_id, member_key: 'email', member_value: user.email }],
          [{ member_id: child_id, member_key: 'status', member_value: user.status }],
          [{ member_id: child_id, member_key: 'creation_date', member_value: user.creation_date }],
          [{ member_id: child_id, member_key: 'activated', member_value: user.activated }],
          [{ member_id: child_id, member_key: 'last_name', member_value: user.last_name }],
          [{ member_id: child_id, member_key: 'first_name', member_value: user.first_name }],
          [{ member_id: child_id, member_key: 'chinese_name', member_value: user.chinese_name }],
          [{ member_id: child_id, member_key: 'gender', member_value: user.gender }],
          [{ member_id: child_id, member_key: 'birthdate', member_value: user.birthday }],
          [{ member_id: child_id, member_key: 'ethnicity', member_value: user.child_ethnicity }],
          [{ member_id: child_id, member_key: 'born_in_hk', member_value: user.born_in_hk }],
          [{ member_id: child_id, member_key: 'date_of_arrival', member_value: user.date_of_arrival }],
          [{ member_id: child_id, member_key: 'child_dev', member_value: user.child_dev }],
          [{ member_id: child_id, member_key: 'child_diag', member_value: user.child_diag }],
          [{ member_id: child_id, member_key: 'birth_place', member_value: user.child_birth_place }],
          [{ member_id: child_id, member_key: 'address', member_value: user.address }]
        ]
      )

      return { group_id, child_id };

    }

    //update meta_data with child
    else {
      child_res = await data.query(`UPDATE member_meta set member_value = :member_value WHERE member_id = :member_id AND member_key = :member_key`,
        [
          [{ member_id: child_id, member_key: 'user_name', member_value: user.username }],
          [{ member_id: child_id, member_key: 'email', member_value: user.email }],
          [{ member_id: child_id, member_key: 'status', member_value: user.status }],
          [{ member_id: child_id, member_key: 'creation_date', member_value: user.creation_date }],
          [{ member_id: child_id, member_key: 'activated', member_value: user.activated }],
          [{ member_id: child_id, member_key: 'last_name', member_value: user.last_name }],
          [{ member_id: child_id, member_key: 'first_name', member_value: user.first_name }],
          [{ member_id: child_id, member_key: 'chinese_name', member_value: user.chinese_name }],
          [{ member_id: child_id, member_key: 'gender', member_value: user.gender }],
          [{ member_id: child_id, member_key: 'birthdate', member_value: user.birthday }],
          [{ member_id: child_id, member_key: 'ethnicity', member_value: user.child_ethnicity }],
          [{ member_id: child_id, member_key: 'born_in_hk', member_value: user.born_in_hk }],
          [{ member_id: child_id, member_key: 'date_of_arrival', member_value: user.date_of_arrival }],
          [{ member_id: child_id, member_key: 'child_dev', member_value: user.child_dev }],
          [{ member_id: child_id, member_key: 'child_diag', member_value: user.child_diag }],
          [{ member_id: child_id, member_key: 'birth_place', member_value: user.child_birth_place }],
          [{ member_id: child_id, member_key: 'address', member_value: user.address }]
        ]
      )

    }
  }

  //Process parent in db
  processParent = (user, mem) => {

    dest_id = await data.query(
      'select destination_id from source_map where source_id = :id',
      { id: user.AdultID_Parent }
    )

    //check if member exists, if not create new
    if (dest_id == 0) {
      let parent_res = await data.transaction().query('insert into member (member_type) VALUES(:member_type)', { member_type: 'parent' })
        .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id, :source_name, :destination_id, :destination_name)'],
          [
            [{ source_id: user.AdultID_Parent, source_name: 'ievents', destination_id: r.insertId, destination_name: 'member' }]
          ])
        .rollback((e, status) => {
          console.log(e)
          return;
        })
        .commit()

      let res = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: user.AdultID_Parent }
      )

      const parent_id = res.forEach((col) => {
        const x = col.destination_id
        return x;
      })

      parent_res = await data.query(['insert into member_group_map (member_id, group_id) values(:member_id, :group_id)',
        { member_id: parent_id, group_id: mem.group_id }])


      parent_res = await data.query('insert into member_relationship (member_id1, member_id2, relationship) VALUES(:id1, :id2, :rel)',
        { id1: parent_id, id2: mem.child_id, rel: user.relationship })


      parent_res = await data.query(`INSERT INTO member_meta (member_id,member_key,member_value) VALUES(:member_id,:member_key,:member_value)`,
        [
          [{ member_id: parent_id, member_key: 'last_name', member_value: user.parent_last_name }],
          [{ member_id: parent_id, member_key: 'first_name', member_value: user.parent_first_name }],
          [{ member_id: parent_id, member_key: 'chinese_name', member_value: user.chinese_name }],
          [{ member_id: parent_id, member_key: 'gender', member_value: user.parent_gender }],
          [{ member_id: parent_id, member_key: 'birthdate', member_value: user.parent_dob }],
          [{ member_id: parent_id, member_key: 'ethnicity', member_value: user.parent_ethnicity }],
          [{ member_id: parent_id, member_key: 'born_in_hk', member_value: user.parent_born_in_hk }],
          [{ member_id: parent_id, member_key: 'date_of_arrival', member_value: user.parent_date_of_arrival }],
          [{ member_id: parent_id, member_key: 'birth_place', member_value: user.parent_birth_place }]
          [{ member_id: parent_id, member_key: 'hkid', member_value: user.parent_hkid }],
          [{ member_id: parent_id, member_key: 'contact_number', member_value: user.parent_contact_no }]
          [{ member_id: parent_id, member_key: 'monthly_income_household', member_value: user.parent_monthly_income_household }]
          [{ member_id: parent_id, member_key: 'cssa_iss', member_value: user.parent_cssa_iss }]
          [{ member_id: parent_id, member_key: 'monthly_income_household', member_value: user.parent_monthly_income_household }],
          [{ member_id: parent_id, member_key: 'hear_about_us', member_value: user.parent_hear_about_us }]
        ]
      )
    }
    else {
      //member exists, update the meta data for parent
      parent_res = await data.query(`UPDATE member_meta set member_value = :member_value WHERE member_id = :member_id AND member_key = :member_key`,
        [
          [{ member_id: parent_id, member_key: 'last_name', member_value: user.parent_last_name }],
          [{ member_id: parent_id, member_key: 'first_name', member_value: user.parent_first_name }],
          [{ member_id: parent_id, member_key: 'chinese_name', member_value: user.chinese_name }],
          [{ member_id: parent_id, member_key: 'gender', member_value: user.parent_gender }],
          [{ member_id: parent_id, member_key: 'birthdate', member_value: user.parent_dob }],
          [{ member_id: parent_id, member_key: 'ethnicity', member_value: user.parent_ethnicity }],
          [{ member_id: parent_id, member_key: 'born_in_hk', member_value: user.parent_born_in_hk }],
          [{ member_id: parent_id, member_key: 'date_of_arrival', member_value: user.parent_date_of_arrival }],
          [{ member_id: parent_id, member_key: 'birth_place', member_value: user.parent_birth_place }]
          [{ member_id: parent_id, member_key: 'hkid', member_value: user.parent_hkid }],
          [{ member_id: parent_id, member_key: 'contact_number', member_value: user.parent_contact_no }]
          [{ member_id: parent_id, member_key: 'monthly_income_household', member_value: user.parent_monthly_income_household }]
          [{ member_id: parent_id, member_key: 'cssa_iss', member_value: user.parent_cssa_iss }]
          [{ member_id: parent_id, member_key: 'monthly_income_household', member_value: user.parent_monthly_income_household }],
          [{ member_id: parent_id, member_key: 'hear_about_us', member_value: user.parent_hear_about_us }]
        ]
      )
    }
  }


  processCC1 = (user, mem) => {

    dest_id = await data.query(
      'select destination_id from source_map where source_id = :id',
      { id: user.AdultID_Caregiver_1 }
    )

    //check if member exists, if not create new
    if (dest_id == 0) {
      let parent_res = await data.transaction().query('insert into member (member_type) VALUES(:member_type)', { member_type: 'parent' })
        .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id, :source_name, :destination_id, :destination_name)'],
          [
            [{ source_id: user.AdultID_Caregiver_1, source_name: 'ievents', destination_id: r.insertId, destination_name: 'member' }]
          ])
        .rollback((e, status) => {
          console.log(e)
          return;
        })
        .commit()

      let res = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: user.AdultID_Caregiver_1 }
      )

      const cc1_id = res.forEach((col) => {
        const x = col.destination_id
        return x;
      })

      parent_res = await data.query(['insert into member_group_map (member_id, group_id) values(:member_id, :group_id)',
        { member_id: cc1_id, group_id: mem.group_id }])


      parent_res = await data.query('insert into member_relationship (member_id1, member_id2, relationship) VALUES(:id1, :id2, :rel)',
        { id1: cc1_id, id2: mem.child_id, rel: user.member_relationship })


      parent_res = await data.query(`INSERT INTO member_meta (member_id,member_key,member_value) VALUES(:member_id,:member_key,:member_value)`,
        [
          [{ member_id: cc1_id, member_key: 'last_name', member_value: user.cgg_1_caregiver_surname }],
          [{ member_id: cc1_id, member_key: 'first_name', member_value: user.cgg_1_caregiver_firstname }],
          [{ member_id: cc1_id, member_key: 'chinese_name', member_value: user.cgg_1_caregiver_chinese_name }],
          [{ member_id: cc1_id, member_key: 'gender', member_value: user.cgg_1_caregiver_gender }],
          [{ member_id: cc1_id, member_key: 'date_of_birth', member_value: user.cgg_1_caregiver_gender }],
          [{ member_id: cc1_id, member_key: 'ethnicity', member_value: user.cgg_1_caregiver_gender }],
          [{ member_id: cc1_id, member_key: 'relationship', member_value: user.cgg_1_caregiver_relationship }],
          [{ member_id: cc1_id, member_key: 'hkid', member_value: user.cgg_1_caregiver_hkid }],
          [{ member_id: cc1_id, member_key: 'contact_number', member_value: user.cgg_1_caregiver_contact_no }]

        ]
      )
    }
    else {
      //member exists, update the meta data for cc1
      parent_res = await data.query(`UPDATE member_meta set member_value = :member_value WHERE member_id = :member_id AND member_key = :member_key`,
        [
          [{ member_id: cc1_id, member_key: 'last_name', member_value: user.cgg_1_caregiver_surname }],
          [{ member_id: cc1_id, member_key: 'first_name', member_value: user.cgg_1_caregiver_firstname }],
          [{ member_id: cc1_id, member_key: 'chinese_name', member_value: user.cgg_1_caregiver_chinese_name }],
          [{ member_id: cc1_id, member_key: 'gender', member_value: user.cgg_1_caregiver_gender }],
          [{ member_id: cc1_id, member_key: 'date_of_birth', member_value: user.cgg_1_caregiver_gender }],
          [{ member_id: cc1_id, member_key: 'ethnicity', member_value: user.cgg_1_caregiver_gender }],
          [{ member_id: cc1_id, member_key: 'relationship', member_value: user.cgg_1_caregiver_relationship }],
          [{ member_id: cc1_id, member_key: 'hkid', member_value: user.cgg_1_caregiver_hkid }],
          [{ member_id: cc1_id, member_key: 'contact_number', member_value: user.cgg_1_caregiver_contact_no }]
        ]
      )
    }

  }


  processCC2 = (user, mem) => {
    dest_id = await data.query(
      'select destination_id from source_map where source_id = :id',
      { id: user.AdultID_Caregiver_2 }
    )

    //check if member exists, if not create new
    if (dest_id == 0) {
      let parent_res = await data.transaction().query('insert into member (member_type) VALUES(:member_type)', { member_type: 'parent' })
        .query((r) => ['insert into source_map (source_id, source_name, destination_id, destination_name) values(:source_id, :source_name, :destination_id, :destination_name)'],
          [
            [{ source_id: user.AdultID_Caregiver_2, source_name: 'ievents', destination_id: r.insertId, destination_name: 'member' }]
          ])
        .rollback((e, status) => {
          console.log(e)
          return;
        })
        .commit()

      let res = await data.query(
        'select destination_id from source_map where source_id = :id',
        { id: user.AdultID_Caregiver_1 }
      )

      const cc2_id = res.forEach((col) => {
        const x = col.destination_id
        return x;
      })

      parent_res = await data.query(['insert into member_group_map (member_id, group_id) values(:member_id, :group_id)',
        { member_id: cc2_id, group_id: mem.group_id }])


      parent_res = await data.query('insert into member_relationship (member_id1, member_id2, relationship) VALUES(:id1, :id2, :rel)',
        { id1: cc2_id, id2: mem.child_id, rel: user.member_relationship })


      parent_res = await data.query(`INSERT INTO member_meta (member_id,member_key,member_value) VALUES(:member_id,:member_key,:member_value)`,
        [
          [{ member_id: cc2_id, member_key: 'last_name', member_value: user.cgg_2_caregiver_surname }],
          [{ member_id: cc2_id, member_key: 'first_name', member_value: user.cgg_2_caregiver_firstname }],
          [{ member_id: cc2_id, member_key: 'chinese_name', member_value: user.cgg_2_caregiver_chinese_name }],
          [{ member_id: cc2_id, member_key: 'gender', member_value: user.cgg_2_caregiver_gender }],
          [{ member_id: cc2_id, member_key: 'date_of_birth', member_value: user.cgg_2_caregiver_gender }],
          [{ member_id: cc2_id, member_key: 'ethnicity', member_value: user.cgg_2_caregiver_gender }],
          [{ member_id: cc2_id, member_key: 'relationship', member_value: user.cgg_2_caregiver_relationship }],
          [{ member_id: cc2_id, member_key: 'hkid', member_value: user.cgg_2_caregiver_hkid }],
          [{ member_id: cc2_id, member_key: 'contact_number', member_value: user.cgg_2_caregiver_contact_no }]

        ]
      )
    }
    else {
      //member exists, update the meta data for cc2
      parent_res = await data.query(`UPDATE member_meta set member_value = :member_value WHERE member_id = :member_id AND member_key = :member_key`,
        [
          [{ member_id: cc2_id, member_key: 'last_name', member_value: user.cgg_2_caregiver_surname }],
          [{ member_id: cc2_id, member_key: 'first_name', member_value: user.cgg_2_caregiver_firstname }],
          [{ member_id: cc2_id, member_key: 'chinese_name', member_value: user.cgg_2_caregiver_chinese_name }],
          [{ member_id: cc2_id, member_key: 'gender', member_value: user.cgg_2_caregiver_gender }],
          [{ member_id: cc2_id, member_key: 'date_of_birth', member_value: user.cgg_2_caregiver_gender }],
          [{ member_id: cc2_id, member_key: 'ethnicity', member_value: user.cgg_2_caregiver_gender }],
          [{ member_id: cc2_id, member_key: 'relationship', member_value: user.cgg_2_caregiver_relationship }],
          [{ member_id: cc2_id, member_key: 'hkid', member_value: user.cgg_2_caregiver_hkid }],
          [{ member_id: cc2_id, member_key: 'contact_number', member_value: user.cgg_2_caregiver_contact_no }]
        ]
      )
    }

  }


  getMember(config);


}


