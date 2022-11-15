<template>
    <v-card class="pa-4">
        <v-card-title class="headline px-0 pt-0"></v-card-title>
        <v-card-text class="px-0 pt-0">건강검진 예약 마감일 : {{getHmeRsvtMagamDt}}</v-card-text>
        <v-card-actions class="pa-0">
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="$emit('onConfirm')">확인</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
import moment from "moment";

export default {
    props: {
        info: Object
    },
    computed: {
        getHmeRsvtMagamDt: {
            get() {
                if (this.info.hmeRsvtMagamDt) {
                    let year = moment().format('YYYY')
                    let month = String(this.info.hmeRsvtMagamDt).substring(4,6)
                    let day = String(this.info.hmeRsvtMagamDt).substring(6)
                    return `${year}.${month}.${day}`
                }
                return this.info.hmeRsvtMagamDt ?? ''
            }
        }
    }
}
</script>