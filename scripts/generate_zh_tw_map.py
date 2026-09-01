#!/usr/bin/env python3
"""以 OpenCC 產生瀏覽器離線使用的精確字串繁體對照表。"""
import json
import pathlib
import subprocess

from opencc import OpenCC

ROOT = pathlib.Path(__file__).resolve().parent.parent
raw = subprocess.check_output(["node", str(ROOT / "scripts/export_user_strings.js")], cwd=ROOT)
strings = json.loads(raw)
opencc_convert = OpenCC("s2tw").convert
inside_phrases = {
    "这里": "這裡", "那里": "那裡", "哪里": "哪裡", "里面": "裡面",
    "里侧": "裡側", "里圈": "裡圈", "里外": "裡外", "场里": "場裡",
    "队里": "隊裡", "队伍里": "隊伍裡", "圈里": "圈裡", "塔里": "塔裡",
}


def convert_text(source: str) -> str:
    # OpenCC 會把 FF 專名中的「里」誤轉成「裡」（如芬里爾、那布里亞勒斯）。
    # 先處理確定表示 inside 的常用詞，再保護其餘「里」作為專名／距離字。
    protected = source
    for simplified, traditional in inside_phrases.items():
        protected = protected.replace(simplified, traditional)
    protected = protected.replace("委托", "委託").replace("托付", "託付")
    protected = protected.replace("里", "\ue000").replace("托", "\ue001")
    return opencc_convert(protected).replace("\ue000", "里").replace("\ue001", "托")


mapping = {source: target for source in strings if (target := convert_text(source)) != source}
payload = "// 由 scripts/generate_zh_tw_map.py 生成；請勿手改。\nwindow.FF14_ZH_TW = "
payload += json.dumps(mapping, ensure_ascii=False, separators=(",", ":")) + ";\n"
(ROOT / "js/zh_tw_map.js").write_text(payload, encoding="utf-8")
print(f"generated={len(mapping)}")
