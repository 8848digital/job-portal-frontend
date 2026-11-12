import {CONSTANTS} from "@/services/config/app-config"
import axios from "axios";


const ForgetPasswordLinkAPI =async (email?:any, token?:any) => {

    let response: any;
    const version = CONSTANTS.VERSION;
    const method = "send_reset_link";
    const entity = "registration";

    const params = `?version=${version}&method=${method}&entity=${entity}`;
    const link:any = encodeURIComponent(`${CONSTANTS.SITE_URL}/reset-password`)
    const config = {
        headers: {
            Accept: "application/json",
            // Authorization: token,
        },
        timeout: 5000,
    };
    await axios
        .post(
            `${CONSTANTS.API_BASE_URL}${CONSTANTS.API_MANDATE_PARAMS}${params}&email=${email}&link=${link}`,undefined,config)
        .then((res) => {
            response = res?.data?.message?.msg;
            console.log(response, "pass reset response in api");
        })
        .catch((err) => {
            console.log(err, "response in api");
        });
    return response;
}

export default ForgetPasswordLinkAPI;