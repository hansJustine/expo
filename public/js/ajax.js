
$(function() {
    $.get('/adminhub/api/datas', (data) => {
        const charData = JSON.stringify(data.allAwards);
        const charData2 = JSON.stringify(data.allBooths);
        var options = {
            series: [{
                data: []
            }],
            chart: {
                type: 'bar',
                height: 300
            },
            title: {
                text: '',
                align: 'center'
            },
            subtitle: {
                text: 'Votes',
                align: 'center',
                floating: true
            },
            dataLabels: {
                enabled: true
            },
            plotOptions: {
                bar: {
                    distributed: true
                }
            },
            xaxis: {
                categories: [],
            },
            colors: [],
            tooltip:{
                theme: 'dark',
                y: {
                    title: {
                        formatter: function(val){
                            return ''
                        }
                    }
                }
            },
            animations: {
                enabled: true
            }
        };
        
        // AWARDS FOR BOOTH
        for(var i = 0; i < data.allAwards.length; i++){
            if(data.allAwards[i].forBooth){
                options.title.text = data.allAwards[i].awardName + ' Award'
                data.allBooths.forEach((booth) => {
                    if(data.allAwards[i].forBooth){
                        options.xaxis.categories.push(booth.boothName);
                        window[booth._id] = 0 
                        booth.vote.forEach((vote) => { 
                            if(vote.awardId == data.allAwards[i]._id && !vote.judgeVote){ 
                                window[booth._id] += Number(vote.voteCount) 
                            }
                        });
                        options.series[0].data.push(window[booth._id]);
                        options.colors.push(booth.color);
                    }
                });
                var chart = new ApexCharts(document.querySelector('#awardBooth'+i), options);
                chart.render();
                options.series[0].data = [];
                options.xaxis.categories = [];
                options.colors = [];
                options.title.text = '';
            }
        }

        var optionsForJudges = {
            series: [{
                data: []
            }],
            chart: {
                type: 'bar',
                height: 300
            },
            title: {
                text: '',
                align: 'center'
            },
            subtitle: {
                text: 'Votes',
                align: 'center',
                floating: true
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val + '%';
                }
            },
            plotOptions: {
                bar: {
                    distributed: true
                }
            },
            yaxis: {
                axisBorder: {
                show: false
                },
                axisTicks: {
                show: false,
                },
                labels: {
                show: true,
                formatter: function (val) {
                    return val + "%";
                }
                }
            
            },
            xaxis: {
                categories: [],
            },
            colors: [],
            tooltip:{
                theme: 'dark',
                y: {
                    title: {
                        formatter: function(val){
                            return ''
                        }
                    }
                }
            },
            animations: {
                enabled: true
            }
        };
        //AWARDS FOR JUDGES
        for(var i = 0; i < data.allAwards.length; i++){
            if(data.allAwards[i].forJudge){
                optionsForJudges.title.text = data.allAwards[i].awardName + ' Award'
                data.allBooths.forEach((booth) => {
                    if(data.allAwards[i].forJudge){
                        optionsForJudges.xaxis.categories.push(booth.boothName);
                        window[booth._id] = 0 
                        window['voteArray' + booth._id] = []
                        booth.vote.forEach((vote) => { 
                            if(vote.awardId == data.allAwards[i]._id && vote.judgeVote){ 
                                window[booth._id] += Number(vote.voteCount);
                                window['voteArray' + booth._id].push(vote.voteCount);
                            }
                        });
                        var result = window[booth._id]/window['voteArray' + booth._id].length;
                        optionsForJudges.series[0].data.push(result);
                        optionsForJudges.colors.push(booth.color);
                    }
                });
                var chart = new ApexCharts(document.querySelector('#awardJudge'+i), optionsForJudges);
                chart.render();
                optionsForJudges.series[0].data = [];
                optionsForJudges.xaxis.categories = [];
                optionsForJudges.colors = [];
                optionsForJudges.title.text = '';
            }
        }
    });

    $.get('/adminhub/api/datas', (data) => {
        const charData = JSON.stringify(data.states);
        const webState = data.states;
        if(webState.state){
            $('.stateBtn').text("Stop the voting");
            $('.stateMsg').text("ONLINE");
            $('.webState').css("color", "#20d420");
        }else{
            $('.stateBtn').text("Start the voting");
            $('.stateMsg').text("OFFLINE");
            $('.webState').css("color", "red");
        }
    });

    $.qrCodeReader.jsQRpath = '/js/jsQR/jsQR.js';
    $.qrCodeReader.beepPath = '/audio/beep.mp3';

    $('#voteBtn').qrCodeReader({
        target: '#printCode',
        audioFeedback: true,
        multiple: false,
        skipDuplicates: true,
        lineColor: '#FF3B58',
        callback: function(code) {
            $.ajax({
                type: 'POST',
                url: '/vote',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({'code': code, 'awardId': $('#awardId').val()})
            }).done(function(data){
                const stringifyData = JSON.stringify(data); 
                if(data.status == '400'){
                    toastr.error(data.msg, "Error");
                }
                if(data.status == '200'){
                    toastr.success(data.msg, "Success!");
                }
            }).fail(function(data){
            })
        }
    });

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-center",
        "preventDuplicates": true,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
});