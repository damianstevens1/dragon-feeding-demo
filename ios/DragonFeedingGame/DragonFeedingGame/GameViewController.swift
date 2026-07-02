import UIKit
import WebKit

final class GameViewController: UIViewController, WKNavigationDelegate {
    private var webView: WKWebView!

    override var prefersStatusBarHidden: Bool {
        true
    }

    override var prefersHomeIndicatorAutoHidden: Bool {
        true
    }

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        .portrait
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 0.10, green: 0.20, blue: 0.17, alpha: 1.0)

        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.translatesAutoresizingMaskIntoConstraints = false

        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])

        loadBundledGame()
    }

    private func loadBundledGame() {
        guard
            let wwwURL = Bundle.main.url(forResource: "www", withExtension: nil),
            let indexURL = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "www")
        else {
            showMissingBuildMessage()
            return
        }

        webView.loadFileURL(indexURL, allowingReadAccessTo: wwwURL)
    }

    private func showMissingBuildMessage() {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "Game files are missing. In Xcode, build again so the web assets are copied into the app."
        label.textColor = .white
        label.textAlignment = .center
        label.numberOfLines = 0
        label.font = .preferredFont(forTextStyle: .headline)
        view.addSubview(label)

        NSLayoutConstraint.activate([
            label.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 28),
            label.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -28),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}
