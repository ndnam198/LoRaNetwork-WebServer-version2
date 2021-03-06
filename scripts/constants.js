const MSG_INDEX = {
    HEADER_SOURCE_ID: 0,
    HEADER_DEST_ID: 1,
    HEADER_MSG_TYPE: 2,
    HEADER_MSG_STATUS: 3,
    HEADER_SEQUENCE_ID: 4,
    DATA_LOCATION: 5,
    DATA_RELAY_STATE: 6,
    DATA_ERR_CODE: 7,
    COMMAND_OPCODE: 8,
    RESET_CAUSE: 9,
}

const OPCODE = {
    OPCODE_NONE: 0,
    REQUEST_STATE: 1,
    RESPOSNE_STATE: 1 + 100,
    REQUEST_RELAY_CONTROL: 2,
    RESPOSNE_RELAY_CONTROL: 2 + 100,
    REQUEST_MCU_RESET: 3,
    RESPOSNE_MCU_RESET: 3 + 100,
    REQUEST_LOCATION_UPDATE: 4,
    RESPOSNE_LOCATION_UPDATE: 4 + 100,
}

module.exports = { MSG_INDEX, OPCODE }
