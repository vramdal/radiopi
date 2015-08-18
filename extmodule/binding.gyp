{
  "targets": [
    {
      "target_name": "monkeyboard",
      "sources": [
        "monkeyboard.cc"
      ],
      "conditions": [
        ['OS=="linux"', {
          'include_dirs': [
            "/home/pi/lib/KSDeviceLibrary"
            ],
            'libraries': ["/home/pi/lib/KeyStoneCOMM/libkeystonecomm.so.1.0"]
          },
        ],
        ['OS=="mac"', {
          'include_dirs': [
            "/Users/vramdal/lib/keystonecomm/KSDeviceLibrary"
            ]
          }
        ]
      ]
    }
  ]
}
