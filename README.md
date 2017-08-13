# IoTBox Atom パッケージ

Raspberry Pi向けに、JavaScriptのプログラムをデプロイするツールです

Raspberry Piをディスプレイに繋がずに、プログラムを転送・実行する作業をAtomパッケージとして提供しています

※現時点で、AtomパッケージはMac OS Xでの検証を行っており、対象としてRaspberry Pi 3での動作を前提としています

# 手順

1. SDカードにRaspbianを書き込み、初回からSSHサーバとしてRaspberry Piが起動するようにSDカード上にsshという名前のファイルを作る(空ファイルでOKです)

2. パッケージの設定を行い、Raspberry Piを起動し、同じネットワーク上に繋いだ状態で、"IoTBox: RPi Setup"を実行してください
これにより、ホスト名の変更・Wifi情報の転送・起動時に実行されるプログラムが転送されます。メッセージに従ってRaspberry Piの再起動を行ってください

3. 再起動後、"IoTBox: toggle"を選びプロジェクト用のパネルを開き、"IoTBox: Put File"でファイルの転送、"IoTBox: Run"でプログラムの実行を行います。"IoTBox: Npm Update"によってpackage.jsonファイルに書かれたライブラリがRaspberry Piに入ります。

# サポート

ニャンパス株式会社
http://nyampass.com/
