let str = '030_Sports Stories, Brooklyn Dribbles 6_"Quit or the Team Will Lose!".pdf,1288947,167f84a017775c0013aaf3,application/pdf,Sun, 16 May 2021 10:16:54 GMT,/英语启蒙/英语启蒙/《小狐狸》Little Fox（高清720P+英文字幕）1-9阶+/Little Fox（音频+单词+测验+原文）1-9阶/level08（13部）/Sports Stories 制作故事书/030_Sports Stories, Brooklyn Dribbles 6_"Quit or the Team Will Lose!".pdf';
let regexp = /^(.+),(\d+),([^,]*),([^,]+),(.+,[^,]*\sGMT),(.+)$/;
let res = regexp.exec(str);
console.log(res);
// '030_Sports Stories, Brooklyn Dribbles 6_"Quit or the Team Will Lose!".pdf',
//   '1288947',
//   '167f84a017775c0013aaf3',
//   'application/pdf',
//   'Sun, 16 May 2021 10:16:54 GMT',
//   '/英语启蒙/英语启蒙/《小狐狸》Little Fox（高清720P+英文字幕）1-9阶+/Little Fox（音频+单词+测验+原文）1-9阶/level08（13部）/Sports Stories 制作故事书/030_Sports Stories, Brooklyn Dribbles 6_"Quit or the Team Will Lose!".pdf',