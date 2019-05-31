module.exports = {
    userCollection: { table_name:'Users', partition_key: 'email', sort_key: 'type', secondary_index: 'celluid', secondary_key: '', non_key_attributes: [] },
    businessCollection: { table_name: 'Businesses', partition_key: 'btype', sort_key: 'shortcode', secondary_index: 'uidbid', secondary_key: '', non_key_attributes: [] }
};
