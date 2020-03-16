export const db = {
    save: function (k, v) {
        window.localStorage.setItem(k, JSON.stringify(v));
    },
    read: function (k, d) {
        let str = window.localStorage.getItem(k);
        if (str) {
            return JSON.parse(str);
        }
        return d;
    }
};