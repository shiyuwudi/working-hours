export const db = {
    save: function (k, v) {
        window.localStorage.setItem(k, JSON.stringify(v));
    },
    read: function (k, d) {

        let str = window.localStorage.getItem(k);
        if (str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                console.log('error occurred while parsing: ', str);
            }
        }
        return d;
    }
};