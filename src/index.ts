import awsLambda from 'aws-lambda';
import axios from 'axios';

const eInvUrl = 'https://api.einvoice.nat.gov.tw/PB2CAPIVAN';
const eInvAppId = '';

const axiosInstance = axios.create({
    baseURL: eInvUrl,
    timeout: 10000,
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
    }
});

async function eInvoiceApisWithAppId(path: string, form: string) {
    try {
        const res = await axiosInstance.post(`${eInvUrl}${path}`, form + `&appID=${eInvAppId}`);
        return res.data;
    } catch (error) {
        throw (error);
    }
}

exports.handler = async (event: awsLambda.APIGatewayProxyEventV2, context: any): Promise<awsLambda.APIGatewayProxyResultV2> => {

    let response: awsLambda.APIGatewayProxyResult;
    try {
        const path = event.requestContext.http.path;
        const originalBody = Buffer.from(event.body!, 'base64').toString();
        if (path === '/twei/login') {
            const res = await eInvoiceApisWithAppId('/invServ/InvServ', originalBody);
            if (+res.code !== 200) {
                console.error(res);
                throw(new Error('登入失敗！'));
            }

            response = {
                statusCode: 200,
                body: JSON.stringify('Success!'),
            };
        } else {
            let res = await eInvoiceApisWithAppId(path, originalBody);
            if (+res.code !== 200) {
                res.msg = `${res.msg}\n${path}\n${originalBody}`;
            }
            response = {
                statusCode: 200,
                body: JSON.stringify(res),
            }
        }
    } catch (err) {
        response = {
            statusCode: 400,
            body: JSON.stringify(`Error! ${err}\n${JSON.stringify(event)}`),
        };
    }
    return response;
};
