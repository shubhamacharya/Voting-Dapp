const ethEnabled = async () => {
    let res = await window.ethereum.request({method:'eth_requestAccounts'});
    window.ethereum.on('accountsChanged', (res) => {
        localStorage.setItem('address',res);
        window.location.reload();
    });
    localStorage.setItem('address',res[0]);
    return res[0];
}

export {ethEnabled}