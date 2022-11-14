<template>
    <v-card-text class="text-center pt-0">
        <v-row class="mt-3">
            <v-col cols="12" md="3">
                <v-select label="시.도 선택" v-model="selectedCityCd" :items="getCityList" outlined dense hide-details @change="changeCity"/>
            </v-col>
            <v-col cols="12" md="3">
                <v-select label="군.구 선택" v-model="selectedDistrictCd" :items="getDistrictList" outlined dense hide-details />
            </v-col>
            <v-col cols="12" sm="3">
                <v-autocomplete v-model="checkedItems" :items="getCheckList" outlined dense chips label="검진항목" small-chips multiple />
            </v-col>
            <v-col cols="12" sm="1">
                <v-btn rounded color="primary" dark @click="onClickSearchBtn"> 검색 </v-btn>
            </v-col>
        </v-row>
        <div v-show="getExistData">
            <v-row class="mt-3" align="center" dense>
                <v-col cols="12">
                    <v-data-table
                        class="elevation-1"
                        :headers="listHeaders"
                        :items="getShowRegnHmcList"
                        :items-per-page="numOfRow"
                        item-key="hmcNo"
                        no-data-text="데이터가 없습니다"
                        mobile-breakpoint="0"
                        hide-default-footer
                        @click:row="getDetailInfo">
                    </v-data-table>
                </v-col>
            </v-row>
            <v-row class="mt-3" align="center" dense>
                <v-col cols="12">
                    <v-pagination
                        v-model="page"
                        :length="pageCount"
                        @input="changePage">
                    </v-pagination>
                </v-col>
            </v-row>
        </div>
        <v-dialog v-model="detailInfoPopup" max-width="390" max-height="390">
            <detail-popup :info="detailInfo" @onConfirm="detailInfoPopup=false"/>
        </v-dialog>
    </v-card-text>
</template>

<script>
import axios from 'axios'
import detailPopup from './detailPopup.vue'

export default {
    components: {
        'detail-popup': detailPopup
    },
    data () {
        return {
            apiAuthKey: '4IyT3mgKGtc5TDHt6tHPXV%2FrhP6mMXAjJ8AezN4vZT%2FQqSJMckr2YA8eYrLYMXN2lfBT%2B0mwO2TtQNbNTE2NtA%3D%3D',
            url: '/api/openapi/service/rest',
            serviceKey: '',
            cityList: [], // 시,도 리스트
            districtList: [], // 군,구 리스트
            checkItemList: [], // 검진항목 리스트
            
            selectedCityCd: '',
            selectedDistrictCd: '',
            checkedItems: [],
            
            listHeaders: [
                { text: '병원명', value: 'hmcNm', sortable: false },
                { text: '전화번호', value: 'hmcTelNo', sortable: false },
                { text: '주소', value: 'locAddr', sortable: false }
            ],
            totalPages: 1,
            page: 1,
            numOfRow: 10,
            regnHmcList : [],   // 검진기관 리스트
            detailInfoPopup: false,
            detailInfo: {}      // 검진기관 상세정보
        }
    },

    mounted() {
        this.serviceKey = '?' + encodeURIComponent('serviceKey') + '=' + this.apiAuthKey
        this.getCityCodeList()
        this.getCheckItemCode()
    },

    methods: {
        // 시.구 선택시 군.구 조회
        changeCity () {
            this.getDistrictCodeList()
        },

        // 검색
        onClickSearchBtn () {
            this.totalPages = 1
            this.page = 1
            this.getRegnHmcList()
        },
        
        // 페이지이동
        changePage() {
            this.getRegnHmcList()
        },

        // 시.도 주소코드 조회
        async getCityCodeList() {
             try {
                 const result = await this.sendAxios('/CodeService/getSiDoList', null)            
                if (result.status === 200) {
                    this.cityList = result.data.response.body.items.item
                }     
            } catch(e) {
                console.log(`getCityCodeList : ${e}`)
            }
        },
            
        // 검진 종류코드 조회
        async getCheckItemCode() {
            try {
                const result = await this.sendAxios('/CodeService/getHchTypeList', null)
                if (result.status === 200) {
                    this.checkItemList = result.data.response.body.items.item
                }
            } catch(e) {
                console.log(`getCheckItemCode : ${e}`)
            }
        },
    
        // 군.구 주소코드 조회
        async getDistrictCodeList() {
            let reqParam = { siDoCd: this.selectedCityCd }
            try {
                const result = await this.sendAxios('/CodeService/getSiGunGuList', reqParam)
                if (result.status === 200) {
                    this.districtList = result.data.response.body.items.item
                }
            } catch(e) {
                console.log(`getDistrictCodeList : ${e}`)
            }
        },

        // 검진기관 통합검색
        async getRegnHmcList() {
            let reqParam = {}
            let hchTypes = ''
            if (this.selectedCityCd !== '') reqParam['siDoCd'] = this.selectedCityCd
            if (this.selectedDistrictCd !== '') reqParam['siGunGuCd'] = this.selectedDistrictCd
            if (this.checkedItems.length > 0) {
                this.checkedItems.forEach((item, idx) => {
                    if (idx === 0) hchTypes += item
                    else hchTypes += `&hchType=${item}`
                 })
            }         
            reqParam['hchType'] = hchTypes
            reqParam['pageNo'] = this.page
            try {
                const result = await this.sendAxios('/HmcSearchService/getHmcList', reqParam)
    
                if (result.status === 200) {
                    const body = result.data.response.body
                    
                    let roundNum = Math.round(body.totalCount / body.numOfRows)
                    let divNum = body.totalCount % body.numOfRows
                    this.totalPages = divNum.toFixed(1) > 0 ? roundNum + 1 : roundNum                  
    
                    this.numOfRow = body.numOfRows
                    
                    this.regnHmcList = body.items.item
                }
            } catch(e) {
                console.log(`getRegnHmcList : ${e}`)
            }
        },
        
        // 병원 정보 조회
        async getDetailInfo(info) {
            let reqParam = { ykiho: info.hmcNo }
            try {
                const result = await this.sendAxios('/HmcSpecificInfoService/getWorkHourInfoDetail', reqParam)
                if (result.status == 200) {
                    this.detailInfo = result.data.response.body.item
                    this.detailInfoPopup = true
                }
            } catch(e) {
                console.log(`getDetailInfo : ${e}`)
            }
        },

        async sendAxios(url, reqParam) {
            const apiUrl = this.url + url + this.serviceKey            
            
            let queryParam = ''
            if (reqParam !== null) {
                Object.keys(reqParam).forEach(key => {
                    queryParam += `&${key}=${reqParam[key]}`
                })
            }

            return await axios.get(apiUrl + queryParam)
        }
    },
    computed: {
        getExistData: {
            get() {
                return this.regnHmcList.length > 0
            }
        },
        getCityList: {
            get() {
                return this.cityList.map(item => {
                    return {
                        text: item.siDoNm,
                        value: item.siDoCd
                    }
                })
            }
        },
        getDistrictList: {
            get() {
                return this.districtList.map(item => {
                    return {
                        text: item.siGunGuNm,
                        value: item.siGunGuCd
                    }
                })
            }
        },
        getCheckList: {
            get() {
                return this.checkItemList.map(item => {
                    return {
                        text: item.detailCodeDesc,
                        value: item.detailCode
                    }
                })
            }
        },
        getShowRegnHmcList: {
            get() {
                return this.regnHmcList.map(item => {
                    return {
                        hmcNo: item.hmcNo,           // 검진기관번호
                        hmcNm: item.hmcNm,          // 검진기관명
                        hmcTelNo: item.hmcTelNo,    // 전화번호
                        locAddr: item.locAddr,      // 주소
                    }
                })
            }
        },
        pageCount: {
            get() {
                return this.totalPages
            }
        }
    }
    
}
</script>